"use server";

import { cacheCasinoLogo } from "@/lib/nivaro-core/assets";
import { evaluateCasinoMarkets, syncBonusMarketCompliance } from "@/lib/nivaro-core/compliance-engine";
import { revalidatePath } from "next/cache";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  validateCasinoInput,
  validateBonusInput,
  validateGuideInput,
  validatePartnerInput,
  validateSeoInput,
} from "@/lib/validation";
import { slugify } from "@/lib/utils";

/*
 * NIVAROBET ADMIN CORE
 *
 * Design goals:
 * - Routine casino management stays in Admin/CMS.
 * - Never require code edits to add or edit a casino.
 * - Preserve current database compatibility.
 * - Prepare casino data for GEO / country SEO architecture.
 * - Keep monitoring source synchronization automatic.
 * - Avoid resetting monitoring state when unrelated fields are edited.
 * - Generate safe SEO fallbacks when custom metadata is not supplied.
 * - Normalize URLs, slugs, country codes and list-like inputs before validation.
 * - Revalidate public/admin pages consistently after content changes.
 * - Keep audit logging non-blocking.
 *
 * IMPORTANT:
 * - requireAdmin() verifies the signed-in administrator.
 * - Writes use the Supabase Service Role client server-side only.
 * - Never expose SUPABASE_SERVICE_ROLE_KEY to the browser/client.
 */

/* =========================================================
   SHARED TYPES
========================================================= */

type UnknownRecord = Record<string, unknown>;

type CasinoSnapshot = {
  id: string;
  name?: string | null;
  slug?: string | null;
  official_url?: string | null;
  affiliate_url?: string | null;
  country_codes?: string[] | null;
  verification_status?: string | null;
  monitoring_status?: string | null;
  next_check_at?: string | null;
};

type SaveResult =
  | {
      success: true;
      casinoId?: string;
      monitoringSourceConfigured?: boolean;
      warning?: string;
    }
  | {
      error: string;
    };

/* =========================================================
   ADMIN CLIENT
========================================================= */

async function getAdminServiceClient() {
  await requireAdmin();

  const supabase = await createSupabaseServiceClient();

  if (!supabase) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Add it to the server environment variables."
    );
  }

  return supabase;
}

/* =========================================================
   GENERIC NORMALIZATION HELPERS
========================================================= */

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nullableString(value: unknown): string | null {
  const clean = cleanString(value);
  return clean || null;
}

function compactSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxLength: number): string {
  const clean = compactSpaces(value);

  if (clean.length <= maxLength) {
    return clean;
  }

  const sliced = clean.slice(0, Math.max(0, maxLength - 1)).trimEnd();
  const lastSpace = sliced.lastIndexOf(" ");

  if (lastSpace > Math.floor(maxLength * 0.65)) {
    return `${sliced.slice(0, lastSpace)}…`;
  }

  return `${sliced}…`;
}

function normalizeHttpUrl(value: unknown): string | null {
  const clean = cleanString(value);

  if (!clean) {
    return null;
  }

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(clean)
    ? clean
    : `https://${clean}`;

  try {
    const url = new URL(candidate);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    url.hash = "";

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeSlugValue(value: unknown, fallback?: unknown): string {
  const fromValue = cleanString(value);
  const fromFallback = cleanString(fallback);

  const candidate = fromValue || fromFallback;

  return slugify(candidate)
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function normalizeListText(value: unknown): string {
  const clean = cleanString(value);

  if (!clean) {
    return "";
  }

  const values = clean
    .split(/[\n,;|]+/)
    .map((item) => compactSpaces(item))
    .filter(Boolean);

  return Array.from(new Set(values)).join(", ");
}

const COUNTRY_CODE_ALIASES: Record<string, string> = {
  UK: "GB",
  GBR: "GB",
  USA: "US",
  DEU: "DE",
  CAN: "CA",
  AUS: "AU",
  AUT: "AT",
  CHE: "CH",
  FRA: "FR",
  ESP: "ES",
  ITA: "IT",
  NLD: "NL",
  BEL: "BE",
  SWE: "SE",
  NOR: "NO",
  DNK: "DK",
  FIN: "FI",
  IRL: "IE",
  PRT: "PT",
  POL: "PL",
  GRC: "GR",
  GEO: "GE",
};

function normalizeCountryCodesInput(value: unknown): string {
  const clean = normalizeListText(value);

  if (!clean) {
    return "";
  }

  const codes = clean
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .map((item) => COUNTRY_CODE_ALIASES[item] ?? item)
    .filter((item) => /^[A-Z]{2}$/.test(item));

  return Array.from(new Set(codes)).join(", ");
}

function getValidationError(
  errors?: string[] | null,
  fallback = "Validation failed."
) {
  return (errors ?? [fallback]).join(", ");
}

function getBooleanFormValue(value: unknown): string {
  const normalized = cleanString(value).toLowerCase();

  return normalized === "true" || normalized === "on" || normalized === "1"
    ? "true"
    : "false";
}

/* =========================================================
   SEO DEFAULTS
========================================================= */

function buildCasinoSeoTitle(name: string): string {
  if (!name) {
    return "Online Casino Review | NivaroBet";
  }

  return truncateText(`${name} Review, Bonuses & Details | NivaroBet`, 60);
}

function buildCasinoSeoDescription(
  name: string,
  description: string,
  welcomeBonus: string
): string {
  if (description) {
    return truncateText(description, 155);
  }

  if (welcomeBonus) {
    return truncateText(
      `Explore ${name}, current bonus information, casino details, payment options and an independent NivaroBet review. Current offer: ${welcomeBonus}`,
      155
    );
  }

  return truncateText(
    `Explore ${name} on NivaroBet with casino details, bonuses, payment information, availability and review information.`,
    155
  );
}

/* =========================================================
   CASINO FORM NORMALIZATION
========================================================= */

const CASINO_LIST_FIELDS = [
  "payment_methods",
  "providers",
  "games",
  "us_states",
  "currencies",
  "languages",
  "region_codes",
  "pros",
  "cons",
] as const;

const CASINO_BOOLEAN_FIELDS = [
  "active",
  "visible",
  "featured",
  "no_deposit",
  "free_spins",
  "crypto",
  "kyc_required",
  "mobile_app",
  "live_chat",
  "vip_program",
  "ai_import_enabled",
  "monitoring_enabled",
  "auto_update_enabled",
  "monitoring_alerts_enabled",
] as const;

const CASINO_URL_FIELDS = [
  "official_url",
  "affiliate_url",
  "logo_url",
  "cover_image_url",
  "support_url",
] as const;

function normalizeCasinoFormInput(
  source: Record<string, FormDataEntryValue>
): Record<string, FormDataEntryValue> {
  const raw: Record<string, FormDataEntryValue> = {
    ...source,
  };

  const name = cleanString(raw.name);
  const slug = normalizeSlugValue(raw.slug, name);

  raw.name = name;
  raw.slug = slug;

  for (const field of CASINO_URL_FIELDS) {
    const normalized = normalizeHttpUrl(raw[field]);
    raw[field] = normalized ?? "";
  }

  for (const field of CASINO_LIST_FIELDS) {
    raw[field] = normalizeListText(raw[field]);
  }

  raw.country_codes = normalizeCountryCodesInput(raw.country_codes);

  for (const field of CASINO_BOOLEAN_FIELDS) {
    raw[field] = getBooleanFormValue(raw[field]);
  }

  const description = compactSpaces(cleanString(raw.description));
  const welcomeBonus = compactSpaces(cleanString(raw.welcome_bonus));

  raw.description = description;
  raw.welcome_bonus = welcomeBonus;

  if (!cleanString(raw.seo_title)) {
    raw.seo_title = buildCasinoSeoTitle(name);
  } else {
    raw.seo_title = truncateText(cleanString(raw.seo_title), 70);
  }

  if (!cleanString(raw.seo_description)) {
    raw.seo_description = buildCasinoSeoDescription(
      name,
      description,
      welcomeBonus
    );
  } else {
    raw.seo_description = truncateText(
      cleanString(raw.seo_description),
      170
    );
  }

  return raw;
}

/* =========================================================
   AUDIT LOG
========================================================= */

async function logAudit(
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {}
) {
  try {
    const sessionClient = await createSupabaseServerClient();

    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    const serviceClient = await createSupabaseServiceClient();

    if (!serviceClient) {
      console.error(
        "Audit log skipped: SUPABASE_SERVICE_ROLE_KEY is missing."
      );
      return;
    }

    const { error } = await serviceClient
      .from("audit_log")
      .insert({
        actor_user_id: user?.id || null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: {
          ...metadata,
          recorded_at: new Date().toISOString(),
        },
      });

    if (error) {
      console.error("Audit log error:", error.message);
    }
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}

/* =========================================================
   CACHE / PAGE REVALIDATION
========================================================= */

function uniquePaths(paths: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      paths
        .filter((path): path is string => Boolean(path))
        .map((path) => path.trim())
        .filter(Boolean)
    )
  );
}

function revalidatePaths(paths: Array<string | null | undefined>) {
  for (const path of uniquePaths(paths)) {
    try {
      revalidatePath(path);
    } catch (error) {
      console.error(`Could not revalidate ${path}:`, error);
    }
  }
}

function revalidateCasinoPublicPages(
  currentSlug?: string | null,
  previousSlug?: string | null
) {
  revalidatePaths([
    "/",
    "/casinos",
    "/compare",
    "/bonuses",
    "/admin",
    "/admin/casinos",
    "/admin/monitoring",
    currentSlug ? `/casinos/${currentSlug}` : null,
    previousSlug && previousSlug !== currentSlug
      ? `/casinos/${previousSlug}`
      : null,
  ]);
}

/* =========================================================
   MONITORING SOURCE SYNCHRONIZATION
========================================================= */

async function syncOfficialMonitoringSource(
  supabase: any,
  casinoId: string,
  officialUrl: string | null
) {
  const cleanUrl = officialUrl?.trim() || "";
  const now = new Date().toISOString();

  const {
    data: existingSource,
    error: findError,
  } = await supabase
    .from("casino_monitor_source")
    .select("id, source_url, enabled")
    .eq("casino_id", casinoId)
    .eq("source_type", "official")
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (findError) {
    throw new Error(
      `Could not read monitoring source: ${findError.message}`
    );
  }

  if (!cleanUrl) {
    if (existingSource?.id && existingSource.enabled !== false) {
      const { error } = await supabase
        .from("casino_monitor_source")
        .update({
          enabled: false,
          paused_reason: "Official casino URL removed in Admin.",
          updated_at: now,
        })
        .eq("id", existingSource.id);

      if (error) {
        throw new Error(
          `Could not disable monitoring source: ${error.message}`
        );
      }
    }

    return {
      configured: false,
      changed: Boolean(existingSource?.source_url),
    };
  }

  if (existingSource?.id) {
    const oldUrl = cleanString(existingSource.source_url);
    const changed = oldUrl !== cleanUrl || existingSource.enabled === false;

    if (changed) {
      const { error } = await supabase
        .from("casino_monitor_source")
        .update({
          source_url: cleanUrl,
          source_name: "Official Casino Website",
          enabled: true,
          monitoring_mode: "automatic",
          priority: 100,
          paused_reason: null,
          confirmed_inaccessible: false,
          access_alert_sent: false,
          last_error: null,
          updated_at: now,
        })
        .eq("id", existingSource.id);

      if (error) {
        throw new Error(
          `Could not update monitoring source: ${error.message}`
        );
      }
    }

    return {
      configured: true,
      changed,
    };
  }

  const { error } = await supabase
    .from("casino_monitor_source")
    .insert({
      casino_id: casinoId,
      source_type: "official",
      source_url: cleanUrl,
      source_name: "Official Casino Website",
      enabled: true,
      monitoring_mode: "automatic",
      priority: 100,
      metadata: {
        created_by: "nivarobet_admin",
        purpose: "official_monitoring",
      },
      created_at: now,
      updated_at: now,
    });

  if (error) {
    throw new Error(
      `Could not create monitoring source: ${error.message}`
    );
  }

  return {
    configured: true,
    changed: true,
  };
}

/* =========================================================
   CASINO HELPERS
========================================================= */

async function getCasinoSnapshot(
  supabase: any,
  id: string
): Promise<CasinoSnapshot | null> {
  const { data, error } = await supabase
    .from("casino")
    .select(
      "id,name,slug,official_url,affiliate_url,country_codes,verification_status,monitoring_status,next_check_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not read casino before update: ${error.message}`);
  }

  return (data ?? null) as CasinoSnapshot | null;
}

async function findCasinoBySlug(
  supabase: any,
  slug: string,
  excludeId?: string | null
) {
  let query = supabase
    .from("casino")
    .select("id,name,slug")
    .eq("slug", slug)
    .limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Could not validate casino slug: ${error.message}`);
  }

  return data ?? null;
}

function countryCodesChanged(
  before?: string[] | null,
  after?: unknown
) {
  const previous = Array.from(
    new Set((before ?? []).map((code) => code.toUpperCase()))
  ).sort();

  const current =
    typeof after === "string"
      ? after
          .split(",")
          .map((code) => code.trim().toUpperCase())
          .filter(Boolean)
          .sort()
      : [];

  return JSON.stringify(previous) !== JSON.stringify(current);
}

/* =========================================================
   CASINOS
========================================================= */


async function syncAiOfferSuggestions(
  supabase: any,
  casinoId: string,
  casinoSlug: string,
  rawSuggestions: unknown
) {
  if (typeof rawSuggestions !== "string" || !rawSuggestions.trim()) return { created: 0, review: 0 };
  let parsed: any[] = [];
  try { parsed = JSON.parse(rawSuggestions); } catch { return { created: 0, review: 0 }; }
  if (!Array.isArray(parsed)) return { created: 0, review: 0 };
  let created = 0;
  let review = 0;
  const now = new Date().toISOString();
  const clean = (value: unknown, max = 1200) => typeof value === "string" && value.trim() ? value.replace(/\s+/g, " ").trim().slice(0, max) : null;

  for (const item of parsed.slice(0, 12)) {
    const title = clean(item?.title, 300);
    const kind = clean(item?.kind, 60) || "other";
    const confidence = Number(item?.confidence || 0);
    if (!title || confidence < 80) continue;
    const status = confidence >= 97 ? "active" : "needs_review";
    if (status === "needs_review") review++;
    const promoCode = clean(item?.promo_code, 120);
    const hashSource = `${casinoId}:${kind}:${title}:${promoCode ?? ""}`;
    const hash = (await import("crypto")).createHash("sha1").update(hashSource).digest("hex").slice(0, 10);

    if (promoCode || kind === "promo_code") {
      const payload = {
        casino_id: casinoId,
        slug: `${casinoSlug}-${kind}-${hash}`,
        code: promoCode,
        title,
        promo_type: kind,
        bonus_text: clean(item?.amount, 700),
        free_spins_count: Number.isFinite(Number(item?.free_spins_count)) ? Math.max(0, Math.round(Number(item?.free_spins_count))) : null,
        no_deposit: kind === "no_deposit",
        min_deposit: clean(item?.min_deposit, 120),
        wagering_requirement: clean(item?.wagering_requirement, 250),
        max_cashout: clean(item?.max_cashout, 180),
        terms: clean(item?.terms),
        source_url: clean(item?.source_url, 1000),
        verified_at: confidence >= 97 ? now : null,
        last_checked_at: now,
        status,
        active: true,
        updated_at: now,
      };
      let existing: { id: string } | null = null;
      const { data: byTitle } = await supabase.from("promo_code").select("id").eq("casino_id", casinoId).eq("title", title).maybeSingle();
      existing = byTitle || null;
      if (!existing?.id && promoCode) {
        const { data: byCode } = await supabase.from("promo_code").select("id").eq("casino_id", casinoId).eq("code", promoCode).maybeSingle();
        existing = byCode || null;
      }
      const { error } = existing?.id
        ? await supabase.from("promo_code").update(payload).eq("id", existing.id)
        : await supabase.from("promo_code").insert({ ...payload, created_at: now });
      if (!error) created++;
      continue;
    }

    const payload = {
      casino_id: casinoId,
      slug: `${casinoSlug}-${kind}-${hash}`,
      type: kind,
      title,
      amount: clean(item?.amount, 700),
      free_spins: Number(item?.free_spins_count) > 0 ? String(Math.round(Number(item?.free_spins_count))) : null,
      free_spins_count: Number(item?.free_spins_count) > 0 ? Math.round(Number(item?.free_spins_count)) : null,
      no_deposit: kind === "no_deposit",
      promo_code: promoCode,
      min_deposit: clean(item?.min_deposit, 120),
      wagering_requirement: clean(item?.wagering_requirement, 250),
      max_cashout: clean(item?.max_cashout, 180),
      terms: clean(item?.terms),
      source: "ai_import",
      source_url: clean(item?.source_url, 1000),
      verified_at: confidence >= 97 ? now : null,
      last_checked_at: now,
      status,
      active: true,
      updated_at: now,
    };
    const { data: existing } = await supabase.from("bonus").select("id").eq("casino_id", casinoId).eq("title", title).maybeSingle();
    const { error } = existing?.id
      ? await supabase.from("bonus").update(payload).eq("id", existing.id)
      : await supabase.from("bonus").insert({ ...payload, created_at: now });
    if (!error) created++;
  }
  return { created, review };
}

export async function saveCasino(formData: FormData): Promise<SaveResult> {
  try {
    const supabase = await getAdminServiceClient();

    const source = Object.fromEntries(formData.entries());
    const raw = normalizeCasinoFormInput(source);

    const id =
      typeof raw.id === "string" && raw.id.trim()
        ? raw.id.trim()
        : null;

    const name = cleanString(raw.name);
    const slug = cleanString(raw.slug);

    if (!name) {
      return {
        error: "Casino name is required.",
      };
    }

    if (!slug) {
      return {
        error: "Casino slug is required.",
      };
    }

    const existingCasino = id
      ? await getCasinoSnapshot(supabase, id)
      : null;

    if (id && !existingCasino) {
      return {
        error: "Casino was not found.",
      };
    }

    const slugOwner = await findCasinoBySlug(
      supabase,
      slug,
      id
    );

    if (slugOwner?.id) {
      return {
        error: `The slug "${slug}" is already used by ${slugOwner.name ?? "another casino"}.`,
      };
    }

    const validated = validateCasinoInput(raw);

    if (!validated.success) {
      return {
        error: getValidationError(validated.errors),
      };
    }

    const now = new Date().toISOString();

    /*
     * These URL values are normalized explicitly here.
     * This keeps newer Admin fields safe even if validation.ts
     * is temporarily behind the form while the schema evolves.
     */
    const officialUrl = normalizeHttpUrl(raw.official_url);
    const affiliateUrl = normalizeHttpUrl(raw.affiliate_url);
    const logoUrl = normalizeHttpUrl(raw.logo_url);
    const coverImageUrl = normalizeHttpUrl(raw.cover_image_url);
    const supportUrl = normalizeHttpUrl(raw.support_url);

    const payload: UnknownRecord = {
      ...validated.data,
      slug,
      official_url: officialUrl,
      affiliate_url: affiliateUrl,
      logo_url: logoUrl,
      cover_image_url: coverImageUrl,
      support_url: supportUrl,
      // Fail closed on every manual/import save. Nivaro Core is the only publisher.
      visible: false,
      updated_at: now,
    };

    let casinoId: string;

    if (id) {
      const { error } = await supabase
        .from("casino")
        .update(payload)
        .eq("id", id);

      if (error) {
        return {
          error: error.message,
        };
      }

      casinoId = id;

      await logAudit("update", "casino", id, {
        name,
        slug,
        previous_slug: existingCasino?.slug ?? null,
        official_url_changed:
          (existingCasino?.official_url ?? null) !== officialUrl,
        affiliate_url_changed:
          (existingCasino?.affiliate_url ?? null) !== affiliateUrl,
        geo_changed: countryCodesChanged(
          existingCasino?.country_codes,
          raw.country_codes
        ),
      });
    } else {
      const { data, error } = await supabase
        .from("casino")
        .insert({
          ...payload,
          created_at: now,
        })
        .select("id")
        .single();

      if (error) {
        return {
          error: error.message,
        };
      }

      casinoId = data.id;

      await logAudit("create", "casino", casinoId, {
        name,
        slug,
        official_url: officialUrl,
        has_affiliate_url: Boolean(affiliateUrl),
        country_codes: cleanString(raw.country_codes),
      });
    }

    let warning: string | undefined;
    let monitoringSourceConfigured = false;

    // Keep brand artwork stable: cache verified/discovered image assets in our own public Supabase bucket.
    if (logoUrl) {
      try {
        const cachedLogo = await cacheCasinoLogo(casinoId, logoUrl);
        if (cachedLogo && cachedLogo !== logoUrl) {
          await supabase.from("casino").update({ logo_url: cachedLogo, updated_at: now }).eq("id", casinoId);
        }
      } catch (assetError) {
        console.error("Casino logo cache failed:", assetError);
      }
    }

    try {
      const monitoringSync = await syncOfficialMonitoringSource(
        supabase,
        casinoId,
        officialUrl
      );

      monitoringSourceConfigured = monitoringSync.configured;

      /*
       * Monitoring is reset only when the official source is new/changed.
       * Editing a description, SEO title, logo or GEO should not destroy
       * a previously healthy monitoring state.
       */
      if (monitoringSync.changed) {
        const { error: monitoringResetError } = await supabase
          .from("casino")
          .update({
            monitoring_status: officialUrl ? "pending" : "paused",
            last_monitoring_error: null,
            next_check_at: officialUrl ? now : null,
            updated_at: now,
          })
          .eq("id", casinoId);

        if (monitoringResetError) {
          console.error(
            "Monitoring reset error:",
            monitoringResetError.message
          );

          warning =
            "Casino saved, but monitoring status could not be reset.";
        }
      }
    } catch (monitoringError) {
      console.error(
        "Monitoring source sync failed:",
        monitoringError
      );

      /*
       * Do not pretend the casino save failed after the database write
       * has already succeeded. Return success + warning instead.
       */
      warning =
        monitoringError instanceof Error
          ? `Casino saved. Monitoring setup needs review: ${monitoringError.message}`
          : "Casino saved. Monitoring setup needs review.";
    }

    // Nivaro Core is intentionally fail-closed: saving a casino never publishes it to a market.
    // Exact regulator/domain + affiliate permission gates are evaluated after the record exists.
    try {
      await evaluateCasinoMarkets(casinoId);
      // Bonuses are manually managed in Admin. Compliance remains fail-closed.
      await syncBonusMarketCompliance(casinoId);
    } catch (complianceError) {
      console.error("Nivaro Core compliance evaluation failed:", complianceError);
      if (!warning) warning = "Casino saved. Market publication remains hidden because compliance verification could not complete.";
    }

    revalidateCasinoPublicPages(
      slug,
      existingCasino?.slug ?? null
    );

    return {
      success: true,
      casinoId,
      monitoringSourceConfigured,
      ...(warning ? { warning } : {}),
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to save casino.",
    };
  }
}

export async function deleteCasino(id: string) {
  try {
    const supabase = await getAdminServiceClient();

    if (!id) {
      return {
        error: "Casino ID is required.",
      };
    }

    const existingCasino = await getCasinoSnapshot(
      supabase,
      id
    );

    const { error } = await supabase
      .from("casino")
      .delete()
      .eq("id", id);

    if (error) {
      return {
        error: error.message,
      };
    }

    await logAudit("delete", "casino", id, {
      name: existingCasino?.name ?? null,
      slug: existingCasino?.slug ?? null,
      official_url: existingCasino?.official_url ?? null,
    });

    revalidateCasinoPublicPages(
      null,
      existingCasino?.slug ?? null
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete casino.",
    };
  }
}

/* =========================================================
   BONUSES
========================================================= */

export async function saveBonus(
  formData: FormData
) {
  try {
    const supabase =
      await getAdminServiceClient();

    const raw =
      Object.fromEntries(
        formData.entries()
      );

    const id =
      typeof raw.id === "string" &&
      raw.id.trim()
        ? raw.id.trim()
        : null;

    if (!raw.slug && raw.title) {
      raw.slug =
        slugify(
          String(raw.title)
        );
    }

    const validated =
      validateBonusInput(raw);

    if (!validated.success) {
      return {
        error: getValidationError(validated.errors),
      };
    }

    const payload = {
      ...validated.data,
      updated_at:
        new Date().toISOString(),
    };

    if (id) {
      const { error } =
        await supabase
          .from("bonus")
          .update(payload)
          .eq("id", id);

      if (error) {
        return {
          error:
            error.message,
        };
      }

      await logAudit(
        "update",
        "bonus",
        id
      );
    } else {
      const {
        data,
        error,
      } = await supabase
        .from("bonus")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        return {
          error:
            error.message,
        };
      }

      await logAudit(
        "create",
        "bonus",
        data.id
      );
    }

    revalidatePaths([
      "/",
      "/bonuses",
      "/casinos",
      "/admin",
      "/admin/bonuses",
    ]);

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to save bonus.",
    };
  }
}

export async function deleteBonus(
  id: string
) {
  try {
    const supabase =
      await getAdminServiceClient();

    if (!id) {
      return {
        error:
          "Bonus ID is required.",
      };
    }

    const { error } =
      await supabase
        .from("bonus")
        .delete()
        .eq("id", id);

    if (error) {
      return {
        error: error.message,
      };
    }

    await logAudit(
      "delete",
      "bonus",
      id
    );

    revalidatePaths([
      "/",
      "/bonuses",
      "/casinos",
      "/admin",
      "/admin/bonuses",
    ]);

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete bonus.",
    };
  }
}

/* =========================================================
   GUIDES
========================================================= */

export async function saveGuide(
  formData: FormData
) {
  try {
    const sessionClient =
      await createSupabaseServerClient();

    await requireAdmin();

    const {
      data: { user },
    } =
      await sessionClient.auth.getUser();

    const supabase =
      await createSupabaseServiceClient();

    if (!supabase) {
      return {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is missing. Add it to the server environment variables.",
      };
    }

    const raw =
      Object.fromEntries(
        formData.entries()
      );

    const id =
      typeof raw.id === "string" &&
      raw.id.trim()
        ? raw.id.trim()
        : null;

    if (!raw.slug && raw.title) {
      raw.slug =
        slugify(
          String(raw.title)
        );
    }

    const validated =
      validateGuideInput(raw);

    if (!validated.success) {
      return {
        error: getValidationError(validated.errors),
      };
    }

    const payload = {
      ...validated.data,
      author_id:
        user?.id || null,
      updated_at:
        new Date().toISOString(),
    };

    if (id) {
      const { error } =
        await supabase
          .from("guide")
          .update(payload)
          .eq("id", id);

      if (error) {
        return {
          error:
            error.message,
        };
      }

      await logAudit(
        "update",
        "guide",
        id
      );
    } else {
      const {
        data,
        error,
      } = await supabase
        .from("guide")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        return {
          error:
            error.message,
        };
      }

      await logAudit(
        "create",
        "guide",
        data.id
      );
    }

    revalidatePaths([
      "/",
      "/guides",
      "/admin",
      "/admin/guides",
    ]);

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to save guide.",
    };
  }
}

export async function deleteGuide(
  id: string
) {
  try {
    const supabase =
      await getAdminServiceClient();

    if (!id) {
      return {
        error:
          "Guide ID is required.",
      };
    }

    const { error } =
      await supabase
        .from("guide")
        .delete()
        .eq("id", id);

    if (error) {
      return {
        error:
          error.message,
      };
    }

    await logAudit(
      "delete",
      "guide",
      id
    );

    revalidatePaths([
      "/",
      "/guides",
      "/admin",
      "/admin/guides",
    ]);

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete guide.",
    };
  }
}

/* =========================================================
   AFFILIATE PARTNERS
========================================================= */

export async function savePartner(
  formData: FormData
) {
  try {
    const supabase =
      await getAdminServiceClient();

    const raw =
      Object.fromEntries(
        formData.entries()
      );

    const id =
      typeof raw.id === "string" &&
      raw.id.trim()
        ? raw.id.trim()
        : null;

    if (!raw.slug && raw.name) {
      raw.slug =
        slugify(
          String(raw.name)
        );
    }

    const validated =
      validatePartnerInput(raw);

    if (!validated.success) {
      return {
        error: getValidationError(validated.errors),
      };
    }

    const payload = {
      ...validated.data,
      updated_at:
        new Date().toISOString(),
    };

    if (id) {
      const { error } =
        await supabase
          .from(
            "affiliate_partner"
          )
          .update(payload)
          .eq("id", id);

      if (error) {
        return {
          error:
            error.message,
        };
      }

      await logAudit(
        "update",
        "affiliate_partner",
        id
      );
    } else {
      const {
        data,
        error,
      } = await supabase
        .from(
          "affiliate_partner"
        )
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        return {
          error:
            error.message,
        };
      }

      await logAudit(
        "create",
        "affiliate_partner",
        data.id
      );
    }

    revalidatePaths([
      "/admin",
      "/admin/partners",
      "/casinos",
    ]);

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to save partner.",
    };
  }
}

/* =========================================================
   SEO SETTINGS
========================================================= */

export async function saveSeoSettings(
  formData: FormData
) {
  try {
    const supabase =
      await getAdminServiceClient();

    const raw =
      Object.fromEntries(
        formData.entries()
      );

    const validated =
      validateSeoInput(raw);

    if (!validated.success) {
      return {
        error: getValidationError(validated.errors),
      };
    }

    const { error } =
      await supabase
        .from("seo_settings")
        .upsert(
          {
            ...validated.data,
            updated_at:
              new Date()
                .toISOString(),
          },
          {
            onConflict:
              "page_key",
          }
        );

    if (error) {
      return {
        error:
          error.message,
      };
    }

    await logAudit(
      "update",
      "seo_settings",
      null,
      {
        page_key:
          validated.data
            .page_key,
      }
    );

    revalidatePaths([
      "/",
      "/casinos",
      "/bonuses",
      "/guides",
      "/compare",
      "/admin",
      "/admin/seo",
    ]);

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to save SEO settings.",
    };
  }
}

/* =========================================================
   ADMIN AUTH
========================================================= */

export async function adminSignOut() {
  const supabase =
    await createSupabaseServerClient();

  await supabase.auth.signOut();

  return {
    success: true,
  };
}

/* =========================================================
   ADMIN READ FUNCTIONS
========================================================= */

export async function getAdminCasinos() {
  const supabase =
    await getAdminServiceClient();

  const {
    data,
    error,
  } = await supabase
    .from("casino")
    .select("*")
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "getAdminCasinos:",
      error.message
    );
    return [];
  }

  return data || [];
}

export async function getAdminBonuses() {
  const supabase =
    await getAdminServiceClient();

  const {
    data,
    error,
  } = await supabase
    .from("bonus")
    .select(
      "*, casino:casino_id(name)"
    )
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "getAdminBonuses:",
      error.message
    );
    return [];
  }

  return data || [];
}

export async function getAdminGuides() {
  const supabase =
    await getAdminServiceClient();

  const {
    data,
    error,
  } = await supabase
    .from("guide")
    .select("*")
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "getAdminGuides:",
      error.message
    );
    return [];
  }

  return data || [];
}

export async function getAdminPartners() {
  const supabase =
    await getAdminServiceClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "affiliate_partner"
    )
    .select("*")
    .order("name");

  if (error) {
    console.error(
      "getAdminPartners:",
      error.message
    );
    return [];
  }

  return data || [];
}

export async function getAdminClicks() {
  const supabase =
    await getAdminServiceClient();

  const {
    data,
    error,
  } = await supabase
    .from("affiliate_click")
    .select(
      "*, casino:casino_id(name), partner:partner_id(name)"
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  if (error) {
    console.error(
      "getAdminClicks:",
      error.message
    );
    return [];
  }

  return data || [];
}

export async function getAdminCommissions() {
  const supabase =
    await getAdminServiceClient();

  const {
    data,
    error,
  } = await supabase
    .from("commission")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  if (error) {
    console.error(
      "getAdminCommissions:",
      error.message
    );
    return [];
  }

  return data || [];
}

export async function getAdminAuditLogs() {
  const supabase =
    await getAdminServiceClient();

  const {
    data,
    error,
  } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  if (error) {
    console.error(
      "getAdminAuditLogs:",
      error.message
    );
    return [];
  }

  return data || [];
}

export async function getAdminIntegrations() {
  const supabase =
    await getAdminServiceClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "integration_config"
    )
    .select("*")
    .order("provider");

  if (error) {
    console.error(
      "getAdminIntegrations:",
      error.message
    );
    return [];
  }

  return data || [];
}

export async function getAdminSyncLogs() {
  const supabase =
    await getAdminServiceClient();

  const {
    data,
    error,
  } = await supabase
    .from("sync_log")
    .select("*")
    .order("started_at", {
      ascending: false,
    })
    .limit(50);

  if (error) {
    console.error(
      "getAdminSyncLogs:",
      error.message
    );
    return [];
  }

  return data || [];
}

export async function getAdminSeoSettings() {
  const supabase =
    await getAdminServiceClient();

  const {
    data,
    error,
  } = await supabase
    .from("seo_settings")
    .select("*")
    .order("page_key");

  if (error) {
    console.error(
      "getAdminSeoSettings:",
      error.message
    );
    return [];
  }

  return data || [];
}

export async function getAdminUsers() {
  const supabase =
    await getAdminServiceClient();

  const {
    data,
    error,
  } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "getAdminUsers:",
      error.message
    );
    return [];
  }

  return data || [];
}

/* =========================================================
   INTEGRATIONS
========================================================= */

export async function saveIntegration(
  formData: FormData
) {
  try {
    const supabase =
      await getAdminServiceClient();

    const provider =
      String(
        formData.get(
          "provider"
        ) || ""
      ).trim();

    const integration_type =
      String(
        formData.get(
          "integration_type"
        ) || ""
      ).trim();

    const enabled =
      formData.get(
        "enabled"
      ) === "on";

    const schedule_cron =
      String(
        formData.get(
          "schedule_cron"
        ) || ""
      ).trim() || null;

    if (
      !provider ||
      !integration_type
    ) {
      return {
        error:
          "Provider and type required",
      };
    }

    const { error } =
      await supabase
        .from(
          "integration_config"
        )
        .upsert(
          {
            provider,
            integration_type,
            enabled,
            schedule_cron,
            updated_at:
              new Date()
                .toISOString(),
          },
          {
            onConflict:
              "provider,integration_type",
          }
        );

    if (error) {
      return {
        error:
          error.message,
      };
    }

    await logAudit(
      "update",
      "integration_config",
      null,
      {
        provider,
        integration_type,
      }
    );

    revalidatePaths([
      "/admin",
      "/admin/integrations",
    ]);

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to save integration.",
    };
  }
}