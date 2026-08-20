"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";


/* ============================================================
   TYPES
============================================================ */

type MonitoringSource = {
  id: string;
  casino_id: string;
  source_type: string;
  source_url: string | null;
  source_name: string | null;
  enabled: boolean;
  monitoring_mode: string;
  priority: number;
  content_hash: string | null;
  etag: string | null;
  last_modified: string | null;
  consecutive_failures: number;
  retry_count: number;
  confirmed_inaccessible: boolean;
  access_alert_sent: boolean;
};


type CasinoForMonitoring = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  official_url?: string | null;
  welcome_bonus?: string | null;
  no_deposit?: boolean | null;
  no_deposit_bonus?: string | null;
  free_spins?: boolean | null;
  free_spins_count?: number | null;
  free_spins_details?: string | null;
  cashback?: string | null;
  min_deposit?: string | null;
  payout_speed?: string | null;
  withdrawal_limits?: string | null;
  monitoring_mode: string | null;
  monitoring_enabled: boolean | null;
  auto_update_enabled: boolean | null;
  monitoring_alerts_enabled: boolean | null;
};


type AIFieldChange = {
  field: string;
  old_value: unknown;
  new_value: unknown;
  confidence: number;
  evidence: string;
};


type AIOfferSnapshot = {
  kind: "welcome" | "no_deposit" | "free_spins" | "cashback" | "promo_code" | "other";
  title: string;
  amount: string | null;
  promo_code: string | null;
  free_spins_count: number | null;
  wagering_requirement: string | null;
  min_deposit: string | null;
  max_cashout: string | null;
  terms: string | null;
  confidence: number;
  evidence: string;
};

type AIAnalysisResult = {
  used: boolean;
  model?: string;
  summary: string;
  confidence: number;
  changes: AIFieldChange[];
  offers: AIOfferSnapshot[];
  requires_review: boolean;
  reason?: string;
  error?: string;
};


type AutomationSettings = {
  global_monitoring_enabled?: boolean;
  global_auto_update_enabled?: boolean;
  global_alerts_enabled?: boolean;
  ai_import_enabled?: boolean;
  check_interval_hours?: number;
  transient_retry_limit?: number;
  pause_after_confirmed_access_failure?: boolean;
};


/* ============================================================
   ADMIN CLIENT
============================================================ */

async function getAdminClient() {
  await requireAdmin();

  const supabase =
    await createSupabaseServiceClient();

  if (!supabase) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing."
    );
  }

  return supabase;
}


function asBoolean(
  value: FormDataEntryValue | null
) {
  return (
    value === "true" ||
    value === "on"
  );
}


/* ============================================================
   GENERAL HELPERS
============================================================ */

function getNextCheckDate(
  hours: number
) {
  const safeHours =
    Number.isFinite(hours) &&
    hours >= 1
      ? hours
      : 24;

  return new Date(
    Date.now() +
      safeHours *
        60 *
        60 *
        1000
  );
}


function createContentHash(
  content: string
) {
  return createHash("sha256")
    .update(content)
    .digest("hex");
}


function normalizeMonitoringText(
  value: string
) {
  return value
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '\"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}


function isPrivateIpv4(
  hostname: string
) {
  const parts =
    hostname
      .split(".")
      .map(Number);

  if (
    parts.length !== 4 ||
    parts.some(
      (part) =>
        !Number.isInteger(part) ||
        part < 0 ||
        part > 255
    )
  ) {
    return false;
  }

  const [a, b] = parts;

  if (a === 10) {
    return true;
  }

  if (
    a === 172 &&
    b >= 16 &&
    b <= 31
  ) {
    return true;
  }

  if (
    a === 192 &&
    b === 168
  ) {
    return true;
  }

  if (a === 127) {
    return true;
  }

  if (
    a === 169 &&
    b === 254
  ) {
    return true;
  }

  return false;
}


function validateMonitoringUrl(
  rawUrl: string
) {
  try {
    const url =
      new URL(rawUrl);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return {
        valid: false,
        reason:
          "Only HTTP or HTTPS monitoring sources are allowed.",
      };
    }

    const hostname =
      url.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      isPrivateIpv4(hostname)
    ) {
      return {
        valid: false,
        reason:
          "Private or local network addresses cannot be monitored.",
      };
    }

    return {
      valid: true,
      url: url.toString(),
    };
  } catch {
    return {
      valid: false,
      reason:
        "Invalid monitoring source URL.",
    };
  }
}


/* ============================================================
   GLOBAL AUTOMATION SETTINGS
============================================================ */

export async function getAutomationSettings(): Promise<AutomationSettings | null> {
  const supabase =
    await getAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "automation_settings"
    )
    .select("*")
    .eq(
      "singleton_key",
      "global"
    )
    .maybeSingle();

  if (error) {
    console.error(
      "getAutomationSettings:",
      error.message
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return data as AutomationSettings;
}


export async function saveAutomationSettings(
  formData: FormData
) {
  try {
    const supabase =
      await getAdminClient();

    const globalMonitoringEnabled =
      asBoolean(
        formData.get(
          "global_monitoring_enabled"
        )
      );

    const globalAutoUpdateEnabled =
      asBoolean(
        formData.get(
          "global_auto_update_enabled"
        )
      );

    const globalAlertsEnabled =
      asBoolean(
        formData.get(
          "global_alerts_enabled"
        )
      );

    const aiImportEnabled =
      asBoolean(
        formData.get(
          "ai_import_enabled"
        )
      );

    const checkInterval =
      Number(
        formData.get(
          "check_interval_hours"
        ) ?? 24
      );

    const retryLimit =
      Number(
        formData.get(
          "transient_retry_limit"
        ) ?? 3
      );

    const {
      error,
    } = await supabase
      .from(
        "automation_settings"
      )
      .upsert(
        {
          singleton_key:
            "global",

          global_monitoring_enabled:
            globalMonitoringEnabled,

          global_auto_update_enabled:
            globalAutoUpdateEnabled,

          global_alerts_enabled:
            globalAlertsEnabled,

          ai_import_enabled:
            aiImportEnabled,

          check_interval_hours:
            Number.isFinite(
              checkInterval
            ) &&
            checkInterval >= 1
              ? checkInterval
              : 24,

          transient_retry_limit:
            Number.isFinite(
              retryLimit
            ) &&
            retryLimit >= 0
              ? retryLimit
              : 3,

          pause_after_confirmed_access_failure:
            true,

          updated_at:
            new Date()
              .toISOString(),
        },
        {
          onConflict:
            "singleton_key",
        }
      );

    if (error) {
      return {
        error:
          error.message,
      };
    }

    revalidatePath(
      "/admin/monitoring"
    );

    revalidatePath(
      "/admin/casinos"
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to save automation settings.",
    };
  }
}


/* ============================================================
   CASINO MONITORING SETTINGS
============================================================ */

export async function saveCasinoMonitoring(
  formData: FormData
) {
  try {
    const supabase =
      await getAdminClient();

    const casinoId =
      String(
        formData.get(
          "casino_id"
        ) ?? ""
      ).trim();

    if (!casinoId) {
      return {
        error:
          "Casino ID is required.",
      };
    }

    const monitoringMode =
      String(
        formData.get(
          "monitoring_mode"
        ) ??
          "automatic"
      );

    const monitoringEnabled =
      asBoolean(
        formData.get(
          "monitoring_enabled"
        )
      );

    const autoUpdateEnabled =
      asBoolean(
        formData.get(
          "auto_update_enabled"
        )
      );

    const alertsEnabled =
      asBoolean(
        formData.get(
          "monitoring_alerts_enabled"
        )
      );

    let monitoringStatus =
      "pending";

    if (!monitoringEnabled) {
      monitoringStatus =
        "paused";
    } else if (
      monitoringMode ===
      "manual"
    ) {
      monitoringStatus =
        "manual";
    } else if (
      monitoringMode ===
      "paused"
    ) {
      monitoringStatus =
        "paused";
    }

    const {
      error,
    } = await supabase
      .from("casino")
      .update({
        monitoring_mode:
          monitoringMode,

        monitoring_enabled:
          monitoringEnabled,

        auto_update_enabled:
          autoUpdateEnabled,

        monitoring_alerts_enabled:
          alertsEnabled,

        monitoring_status:
          monitoringStatus,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        casinoId
      );

    if (error) {
      return {
        error:
          error.message,
      };
    }

    revalidatePath(
      "/admin/monitoring"
    );

    revalidatePath(
      "/admin/casinos"
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to update casino monitoring.",
    };
  }
}


/* ============================================================
   MONITORING DATA
============================================================ */

export async function getMonitoringCasinos() {
  const supabase =
    await getAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from("casino")
    .select(`
      id,
      name,
      slug,
      logo_url,
      active,
      monitoring_mode,
      monitoring_enabled,
      auto_update_enabled,
      monitoring_alerts_enabled,
      monitoring_status,
      last_checked_at,
      last_successful_check_at,
      next_check_at,
      last_monitoring_error
    `)
    .order("name");

  if (error) {
    console.error(
      "getMonitoringCasinos:",
      error.message
    );

    return [];
  }

  return data ?? [];
}


export async function getMonitoringAlerts() {
  const supabase =
    await getAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "monitoring_alert"
    )
    .select(`
      *,
      casino:casino_id (
        id,
        name,
        slug
      )
    `)
    .eq(
      "status",
      "open"
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      }
    )
    .limit(100);

  if (error) {
    console.error(
      "getMonitoringAlerts:",
      error.message
    );

    return [];
  }

  return data ?? [];
}


/* ============================================================
   ALERT HELPER
============================================================ */

async function createOrUpdateOpenAlert(
  supabase: any,
  input: {
    casinoId: string;
    sourceId?: string | null;
    alertType: string;
    severity:
      | "info"
      | "warning"
      | "critical";
    title: string;
    message: string;
    dedupeKey: string;
    details?: Record<
      string,
      unknown
    >;
  }
) {
  const {
    data: existing,
  } = await supabase
    .from(
      "monitoring_alert"
    )
    .select("id")
    .eq(
      "dedupe_key",
      input.dedupeKey
    )
    .eq(
      "status",
      "open"
    )
    .maybeSingle();

  const now =
    new Date()
      .toISOString();

  if (existing?.id) {
    await supabase
      .from(
        "monitoring_alert"
      )
      .update({
        alert_type:
          input.alertType,

        severity:
          input.severity,

        title:
          input.title,

        message:
          input.message,

        details:
          input.details ??
          {},

        last_seen_at:
          now,

        updated_at:
          now,
      })
      .eq(
        "id",
        existing.id
      );

    return;
  }

  await supabase
    .from(
      "monitoring_alert"
    )
    .insert({
      casino_id:
        input.casinoId,

      source_id:
        input.sourceId ??
        null,

      alert_type:
        input.alertType,

      severity:
        input.severity,

      title:
        input.title,

      message:
        input.message,

      dedupe_key:
        input.dedupeKey,

      details:
        input.details ??
        {},

      status:
        "open",

      first_seen_at:
        now,

      last_seen_at:
        now,

      created_at:
        now,

      updated_at:
        now,
    });
}


/* ============================================================
   GEMINI AI ANALYSIS

   Gemini is intentionally used only after:
   1) the public source fetch succeeds, and
   2) the normalized source content hash actually changes.

   This keeps the free-tier/API usage low and avoids unnecessary
   AI calls when a casino page has not materially changed.

   Required production environment variable:
   GEMINI_API_KEY

   Optional:
   GEMINI_MONITORING_MODEL
   GEMINI_MODEL

   Default model:
   gemini-3.5-flash-lite
============================================================ */

const AI_ALLOWED_FIELDS = new Set([
  "welcome_bonus",
  "no_deposit",
  "no_deposit_bonus",
  "free_spins",
  "free_spins_count",
  "free_spins_details",
  "cashback",
  "min_deposit",
  "payout_speed",
  "withdrawal_limits",
]);

const AUTO_UPDATE_SOURCE_TYPES = new Set([
  "official",
  "bonuses",
  "promotions",
  "promo_codes",
  "affiliate_feed",
  "api",
]);

const AI_AUTO_UPDATE_CONFIDENCE = 0.97;
const AI_MAX_SOURCE_CHARS = 30000;
const GEMINI_TIMEOUT_MS = 30000;
const GEMINI_MAX_ATTEMPTS = 3;

function clampConfidence(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(1, number));
}

function extractGeminiResponseText(payload: any) {
  const candidates =
    Array.isArray(payload?.candidates)
      ? payload.candidates
      : [];

  const parts =
    candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part: any) =>
      typeof part?.text === "string"
        ? part.text
        : ""
    )
    .filter(Boolean)
    .join("\n")
    .trim();
}

function parseJsonObject(value: string) {
  const trimmed = value.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace =
      trimmed.indexOf("{");

    const lastBrace =
      trimmed.lastIndexOf("}");

    if (
      firstBrace >= 0 &&
      lastBrace > firstBrace
    ) {
      return JSON.parse(
        trimmed.slice(
          firstBrace,
          lastBrace + 1
        )
      );
    }

    throw new Error(
      "Gemini response did not contain valid JSON."
    );
  }
}

function normalizeAIChange(
  change: any
): AIFieldChange | null {
  const field =
    String(
      change?.field ?? ""
    ).trim();

  if (
    !AI_ALLOWED_FIELDS.has(
      field
    )
  ) {
    return null;
  }

  const evidence =
    String(
      change?.evidence ?? ""
    )
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500);

  return {
    field,

    old_value:
      change?.old_value ??
      null,

    new_value:
      change?.new_value ??
      null,

    confidence:
      clampConfidence(
        change?.confidence
      ),

    evidence,
  };
}

function normalizeAIOffer(value: any): AIOfferSnapshot | null {
  const allowed = new Set(["welcome","no_deposit","free_spins","cashback","promo_code","other"]);
  const kind = String(value?.kind ?? "other").trim().toLowerCase();
  const title = String(value?.title ?? "").replace(/\s+/g," ").trim().slice(0,300);
  const evidence = String(value?.evidence ?? "").replace(/\s+/g," ").trim().slice(0,500);
  if (!allowed.has(kind) || !title || evidence.length < 8) return null;
  const clean = (v: unknown, max = 700) => typeof v === "string" && v.trim() ? v.replace(/\s+/g," ").trim().slice(0,max) : null;
  const fs = Number(value?.free_spins_count);
  return {
    kind: kind as AIOfferSnapshot["kind"],
    title,
    amount: clean(value?.amount),
    promo_code: clean(value?.promo_code,120),
    free_spins_count: Number.isFinite(fs) && fs > 0 ? Math.round(fs) : null,
    wagering_requirement: clean(value?.wagering_requirement,250),
    min_deposit: clean(value?.min_deposit,120),
    max_cashout: clean(value?.max_cashout,180),
    terms: clean(value?.terms,1200),
    confidence: clampConfidence(value?.confidence),
    evidence,
  };
}

function isRetryableGeminiStatus(
  status: number
) {
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

async function sleep(
  milliseconds: number
) {
  await new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        milliseconds
      )
  );
}

async function requestGeminiJson(
  prompt: string,
  model: string,
  apiKey: string
) {
  let lastError:
    Error |
    null =
    null;

  for (
    let attempt = 1;
    attempt <= GEMINI_MAX_ATTEMPTS;
    attempt++
  ) {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        GEMINI_TIMEOUT_MS
      );

    try {
      const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model
        )}:generateContent`;

      const response =
        await fetch(
          endpoint,
          {
            method: "POST",

            signal:
              controller.signal,

            cache:
              "no-store",

            headers: {
              "x-goog-api-key":
                apiKey,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                contents: [
                  {
                    role:
                      "user",

                    parts: [
                      {
                        text:
                          prompt,
                      },
                    ],
                  },
                ],

                generationConfig: {
                  responseMimeType:
                    "application/json",

                  temperature:
                    0.05,

                  maxOutputTokens:
                    4096,
                },
              }),
          }
        );

      const payload =
        await response
          .json()
          .catch(
            () =>
              null
          );

      if (
        response.ok
      ) {
        const outputText =
          extractGeminiResponseText(
            payload
          );

        if (
          !outputText
        ) {
          const finishReason =
            payload
              ?.candidates
              ?.[0]
              ?.finishReason;

          throw new Error(
            finishReason
              ? `Gemini returned no text (finish reason: ${finishReason}).`
              : "Gemini returned an empty response."
          );
        }

        return {
          payload,
          outputText,
          attempt,
        };
      }

      const apiMessage =
        payload
          ?.error
          ?.message ||
        `Gemini API returned HTTP ${response.status}.`;

      const error =
        new Error(
          apiMessage
        );

      if (
        !isRetryableGeminiStatus(
          response.status
        ) ||
        attempt ===
          GEMINI_MAX_ATTEMPTS
      ) {
        throw error;
      }

      lastError =
        error;

      const retryAfter =
        Number(
          response.headers.get(
            "retry-after"
          )
        );

      const waitMs =
        Number.isFinite(
          retryAfter
        ) &&
        retryAfter > 0
          ? Math.min(
              retryAfter *
                1000,
              8000
            )
          : Math.min(
              750 *
                2 **
                  (attempt - 1),
              5000
            );

      await sleep(
        waitMs
      );
    } catch (
      error
    ) {
      const normalizedError =
        error instanceof Error
          ? error
          : new Error(
              "Unknown Gemini request error."
            );

      lastError =
        normalizedError;

      if (
        attempt ===
        GEMINI_MAX_ATTEMPTS
      ) {
        throw normalizedError;
      }

      await sleep(
        Math.min(
          750 *
            2 **
              (attempt - 1),
          5000
        )
      );
    } finally {
      clearTimeout(
        timeout
      );
    }
  }

  throw (
    lastError ??
    new Error(
      "Gemini request failed."
    )
  );
}

async function analyzeMonitoringContentWithAI(
  casino: CasinoForMonitoring,
  source: MonitoringSource,
  sourceText: string
): Promise<AIAnalysisResult> {
  const apiKey =
    process.env
      .GEMINI_API_KEY
      ?.trim();

  if (
    !apiKey
  ) {
    return {
      used: false,

      summary:
        "AI analysis skipped because GEMINI_API_KEY is not configured.",

      confidence: 0,

      changes: [],

      offers: [],

      requires_review:
        true,

      reason:
        "GEMINI_API_KEY is missing.",
    };
  }

  if (
    sourceText.length <
    120
  ) {
    return {
      used: false,

      summary:
        "AI analysis skipped because the fetched source contained too little readable text.",

      confidence: 0,

      changes: [],

      offers: [],

      requires_review:
        true,

      reason:
        "Source text is too short for reliable analysis.",
    };
  }

  const model =
    process.env
      .GEMINI_MONITORING_MODEL
      ?.trim() ||
    process.env
      .GEMINI_MODEL
      ?.trim() ||
    "gemini-3.5-flash-lite";

  const currentData = {
    welcome_bonus:
      casino.welcome_bonus ??
      null,

    no_deposit:
      casino.no_deposit ??
      null,

    no_deposit_bonus:
      casino.no_deposit_bonus ??
      null,

    free_spins:
      casino.free_spins ??
      null,

    free_spins_count:
      casino.free_spins_count ??
      null,

    free_spins_details:
      casino.free_spins_details ??
      null,

    cashback:
      casino.cashback ??
      null,

    min_deposit:
      casino.min_deposit ??
      null,

    payout_speed:
      casino.payout_speed ??
      null,

    withdrawal_limits:
      casino.withdrawal_limits ??
      null,
  };

  const prompt = `You are NivaroBet's casino monitoring verifier.

Your job is to compare CURRENT PUBLIC NIVAROBET DATA with readable text fetched from a configured PUBLIC casino source.

STRICT ACCURACY AND SAFETY RULES:
- Use only facts explicitly supported by SOURCE TEXT.
- Never invent or guess missing values.
- Never treat absence of a phrase as proof that an offer was removed.
- Never access, request, infer, expose, or discuss affiliate earnings, balances, revenue, banking, wallets, credentials, private partner data, or user data.
- Ignore cosmetic website changes, navigation changes, cookie banners, timestamps, scripts, ads, and unrelated text.
- Only report changes for these fields:
  welcome_bonus,
  no_deposit,
  no_deposit_bonus,
  free_spins,
  free_spins_count,
  free_spins_details,
  cashback,
  min_deposit,
  payout_speed,
  withdrawal_limits.
- For payment/withdrawal fields, only report a change when the source explicitly states the current value or limit.
- A removal, expiration, or negative change must set requires_review=true unless SOURCE TEXT explicitly and clearly states that the relevant offer ended, expired, was withdrawn, or is unavailable.
- confidence must be between 0 and 1.
- evidence must be a short supporting excerpt or faithful short paraphrase from SOURCE TEXT.
- If there is no explicit relevant change, return an empty changes array.
- Prefer false positives to be avoided. When uncertain, require review rather than proposing an automatic change.
- Preserve exact numeric bonus/free-spin values when they are clearly stated.
- Do not convert currencies or infer wagering terms.
- Also extract CURRENT explicitly stated offers from SOURCE TEXT into offers. This is for structured bonus/promo monitoring.
- For offers, capture only explicitly stated title/value/code/free-spins/wagering/min-deposit/max-cashout/terms. Never infer missing terms.
- A promo code must only be returned when the exact code string is visible in SOURCE TEXT.
- Return ONLY valid JSON.

Return exactly this JSON shape:
{
  "summary": "short summary",
  "confidence": 0.0,
  "requires_review": false,
  "reason": "short reason or empty string",
  "changes": [
    {
      "field": "welcome_bonus",
      "old_value": null,
      "new_value": "explicit new value",
      "confidence": 0.99,
      "evidence": "supporting source evidence"
    }
  ],
  "offers": [
    {
      "kind": "promo_code",
      "title": "explicit offer title",
      "amount": null,
      "promo_code": "EXACTCODE",
      "free_spins_count": 50,
      "wagering_requirement": null,
      "min_deposit": null,
      "max_cashout": null,
      "terms": null,
      "confidence": 0.99,
      "evidence": "supporting source evidence"
    }
  ]
}

CASINO:
${casino.name}

SOURCE TYPE:
${source.source_type}

SOURCE URL:
${source.source_url ?? ""}

CURRENT PUBLIC NIVAROBET DATA:
${JSON.stringify(currentData)}

SOURCE TEXT:
${sourceText.slice(
  0,
  AI_MAX_SOURCE_CHARS
)}`;

  try {
    const {
      outputText,
    } =
      await requestGeminiJson(
        prompt,
        model,
        apiKey
      );

    const parsed =
      parseJsonObject(
        outputText
      );

    const changes =
      Array.isArray(
        parsed?.changes
      )
        ? parsed.changes
            .map(
              normalizeAIChange
            )
            .filter(
              Boolean
            ) as AIFieldChange[]
        : [];

    const offers = Array.isArray(parsed?.offers)
      ? parsed.offers.map(normalizeAIOffer).filter(Boolean) as AIOfferSnapshot[]
      : [];

    return {
      used: true,

      model,

      summary:
        String(
          parsed?.summary ??
            "Gemini analysis completed."
        )
          .trim()
          .slice(
            0,
            1000
          ),

      confidence:
        clampConfidence(
          parsed?.confidence
        ),

      changes,

      offers,

      requires_review:
        Boolean(
          parsed
            ?.requires_review
        ),

      reason:
        String(
          parsed?.reason ??
            ""
        )
          .trim()
          .slice(
            0,
            1000
          ),
    };
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Gemini analysis error.";

    return {
      used: false,

      model,

      summary:
        "Gemini analysis failed.",

      confidence: 0,

      changes: [],

      offers: [],

      requires_review:
        true,

      reason:
        message,

      error:
        message,
    };
  }
}


function sanitizeAutoUpdateValue(
  field: string,
  value: unknown
): unknown {
  if (
    field ===
      "welcome_bonus" ||
    field ===
      "no_deposit_bonus" ||
    field ===
      "free_spins_details" ||
    field ===
      "cashback" ||
    field ===
      "min_deposit" ||
    field ===
      "payout_speed" ||
    field ===
      "withdrawal_limits"
  ) {
    if (
      typeof value !==
      "string"
    ) {
      return undefined;
    }

    const clean =
      value
        .replace(
          /\s+/g,
          " "
        )
        .trim()
        .slice(
          0,
          1000
        );

    return (
      clean ||
      undefined
    );
  }

  if (
    field ===
      "no_deposit" ||
    field ===
      "free_spins"
  ) {
    return value === true
      ? true
      : undefined;
  }

  if (
    field ===
    "free_spins_count"
  ) {
    const number =
      Number(value);

    if (
      !Number.isFinite(
        number
      ) ||
      number <= 0
    ) {
      return undefined;
    }

    return Math.round(
      number
    );
  }

  return undefined;
}


async function applyVerifiedAIChanges(
  supabase: any,
  casino: CasinoForMonitoring,
  source: MonitoringSource,
  settings: AutomationSettings,
  analysis: AIAnalysisResult
) {
  const autoUpdateAllowed =
    settings
      .global_auto_update_enabled !==
      false &&
    casino
      .auto_update_enabled !==
      false &&
    AUTO_UPDATE_SOURCE_TYPES.has(
      source.source_type
    );

  const updatePayload:
    Record<
      string,
      unknown
    > =
    {};

  const applied:
    AIFieldChange[] =
    [];

  const review:
    AIFieldChange[] =
    [];

  for (
    const change
    of analysis.changes
  ) {
    const sanitized =
      sanitizeAutoUpdateValue(
        change.field,
        change.new_value
      );

    const safeForAutomaticUpdate =
      autoUpdateAllowed &&
      analysis.confidence >=
        AI_AUTO_UPDATE_CONFIDENCE &&
      change.confidence >=
        AI_AUTO_UPDATE_CONFIDENCE &&
      change.evidence.length >=
        8 &&
      sanitized !==
        undefined &&
      !analysis.requires_review;

    if (
      safeForAutomaticUpdate
    ) {
      updatePayload[
        change.field
      ] =
        sanitized;

      applied.push(
        change
      );
    } else {
      review.push(
        change
      );
    }
  }

  if (
    Object.keys(
      updatePayload
    ).length >
    0
  ) {
    updatePayload.updated_at =
      new Date()
        .toISOString();

    const {
      error,
    } =
      await supabase
        .from(
          "casino"
        )
        .update(
          updatePayload
        )
        .eq(
          "id",
          casino.id
        );

    if (error) {
      throw new Error(
        `AI verified data could not be applied: ${error.message}`
      );
    }
  }

  return {
    applied,
    review,
  };
}


async function syncVerifiedOffersFromAI(
  supabase: any,
  casino: CasinoForMonitoring,
  source: MonitoringSource,
  settings: AutomationSettings,
  analysis: AIAnalysisResult
) {
  const autoUpdateAllowed =
    settings.global_auto_update_enabled !== false &&
    casino.auto_update_enabled !== false &&
    AUTO_UPDATE_SOURCE_TYPES.has(source.source_type);

  const applied: AIOfferSnapshot[] = [];
  const review: AIOfferSnapshot[] = [];
  const now = new Date().toISOString();

  for (const offer of analysis.offers) {
    const safe = autoUpdateAllowed &&
      !analysis.requires_review &&
      analysis.confidence >= AI_AUTO_UPDATE_CONFIDENCE &&
      offer.confidence >= AI_AUTO_UPDATE_CONFIDENCE &&
      offer.evidence.length >= 8;

    if (!safe) {
      review.push(offer);
      continue;
    }

    const base = {
      casino_id: casino.id,
      title: offer.title,
      wagering_requirement: offer.wagering_requirement,
      min_deposit: offer.min_deposit,
      max_cashout: offer.max_cashout,
      terms: offer.terms,
      source_url: source.source_url,
      verified_at: now,
      last_checked_at: now,
      status: "active",
      active: true,
      updated_at: now,
    };

    if (offer.kind === "promo_code" || offer.promo_code) {
      let existing: { id: string } | null = null;
      const { data: byTitle } = await supabase.from("promo_code").select("id").eq("casino_id", casino.id).eq("title", offer.title).maybeSingle();
      existing = byTitle || null;
      if (!existing?.id && offer.promo_code) {
        const { data: byCode } = await supabase.from("promo_code").select("id").eq("casino_id", casino.id).eq("code", offer.promo_code).maybeSingle();
        existing = byCode || null;
      }
      const payload = {
        ...base,
        code: offer.promo_code,
        promo_type: offer.kind,
        bonus_text: offer.amount,
        free_spins_count: offer.free_spins_count,
        no_deposit: offer.kind === "no_deposit",
      };
      if (existing?.id) {
        const { error } = await supabase.from("promo_code").update(payload).eq("id", existing.id);
        if (error) throw new Error(`Promo code monitoring update failed: ${error.message}`);
      } else {
        const hash = createHash("sha1").update(`${casino.id}:${offer.kind}:${offer.title}:${offer.promo_code ?? ""}`).digest("hex").slice(0, 10);
        const { error } = await supabase.from("promo_code").insert({ ...payload, slug: `${casino.slug}-${offer.kind}-${hash}`, created_at: now });
        if (error) throw new Error(`Promo code monitoring insert failed: ${error.message}`);
      }
      applied.push(offer);
      continue;
    }

    const { data: existing } = await supabase
      .from("bonus")
      .select("id")
      .eq("casino_id", casino.id)
      .eq("title", offer.title)
      .maybeSingle();

    const bonusPayload = {
      ...base,
      type: offer.kind,
      amount: offer.amount,
      free_spins: offer.free_spins_count ? String(offer.free_spins_count) : null,
      free_spins_count: offer.free_spins_count,
      no_deposit: offer.kind === "no_deposit",
      promo_code: offer.promo_code,
      source: source.source_type,
    };

    if (existing?.id) {
      const { error } = await supabase.from("bonus").update(bonusPayload).eq("id", existing.id);
      if (error) throw new Error(`Bonus monitoring update failed: ${error.message}`);
    } else {
      const hash = createHash("sha1").update(`${casino.id}:${offer.kind}:${offer.title}`).digest("hex").slice(0, 10);
      const { error } = await supabase.from("bonus").insert({ ...bonusPayload, slug: `${casino.slug}-${offer.kind}-${hash}`, created_at: now });
      if (error) throw new Error(`Bonus monitoring insert failed: ${error.message}`);
    }
    applied.push(offer);
  }

  return { applied, review };
}

/* ============================================================
   FETCH MONITORING SOURCE
============================================================ */

async function fetchMonitoringSource(
  url: string,
  retryLimit: number
) {
  const attempts =
    Math.max(
      1,
      Math.min(
        retryLimit +
          1,
        4
      )
    );

  let lastError:
    | Error
    | null =
    null;

  for (
    let attempt =
      1;
    attempt <=
    attempts;
    attempt++
  ) {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        15000
      );

    try {
      const response =
        await fetch(
          url,
          {
            method:
              "GET",

            redirect:
              "follow",

            cache:
              "no-store",

            signal:
              controller.signal,

            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 NivaroMonitor/1.0",

              Accept:
                "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",

              "Accept-Language":
                "en-US,en;q=0.9",

              "Cache-Control":
                "no-cache",
            },
          }
        );

      clearTimeout(
        timeout
      );

      const body =
        await response
          .text();

      return {
        success:
          response.ok,

        status:
          response.status,

        statusText:
          response.statusText,

        body,

        etag:
          response.headers.get(
            "etag"
          ),

        lastModified:
          response.headers.get(
            "last-modified"
          ),

        contentType:
          response.headers.get(
            "content-type"
          ),

        attempt,
      };
    } catch (error) {
      clearTimeout(
        timeout
      );

      lastError =
        error instanceof
        Error
          ? error
          : new Error(
              "Unknown network error."
            );

      if (
        attempt <
        attempts
      ) {
        await new Promise(
          (
            resolve
          ) =>
            setTimeout(
              resolve,
              750 *
                attempt
            )
        );
      }
    }
  }

  throw (
    lastError ??
    new Error(
      "Monitoring request failed."
    )
  );
}


/* ============================================================
   RUN ONE CASINO CHECK — INTERNAL ENGINE
============================================================ */

async function executeCasinoMonitoringCheck(
  supabase: any,
  casino: CasinoForMonitoring,
  settings: AutomationSettings
) {
  const now =
    new Date();

  const nowIso =
    now.toISOString();

  const intervalHours =
    Number(
      settings
        ?.check_interval_hours ??
        24
    );

  const nextCheck =
    getNextCheckDate(
      intervalHours
    );

  const nextCheckIso =
    nextCheck.toISOString();

  const retryLimit =
    Number(
      settings
        ?.transient_retry_limit ??
        3
    );

  if (
    !casino
      .monitoring_enabled
  ) {
    await supabase
      .from(
        "casino"
      )
      .update({
        monitoring_status:
          "paused",

        last_checked_at:
          nowIso,

        next_check_at:
          null,

        last_monitoring_error:
          null,
      })
      .eq(
        "id",
        casino.id
      );

    return {
      success:
        false,
      status:
        "paused",
      message:
        `${casino.name} monitoring is disabled.`,
    };
  }

  if (
    casino
      .monitoring_mode ===
    "paused"
  ) {
    return {
      success:
        false,
      status:
        "paused",
      message:
        `${casino.name} monitoring is paused.`,
    };
  }

  const {
    data:
      sourceData,
    error:
      sourceError,
  } = await supabase
    .from(
      "casino_monitor_source"
    )
    .select("*")
    .eq(
      "casino_id",
      casino.id
    )
    .eq(
      "enabled",
      true
    )
    .order(
      "priority",
      {
        ascending:
          false,
      }
    );

  if (
    sourceError
  ) {
    throw new Error(
      sourceError.message
    );
  }

  const sources =
    (
      sourceData ??
      []
    ) as MonitoringSource[];

  if (
    sources.length ===
    0
  ) {
    const message =
      "No monitoring source has been configured for this casino.";

    await supabase
      .from(
        "monitoring_run"
      )
      .insert({
        casino_id:
          casino.id,

        source_id:
          null,

        status:
          "failed",

        attempt_count:
          1,

        records_checked:
          0,

        changes_detected:
          0,

        changes_applied:
          0,

        ai_used:
          false,

        error_code:
          "NO_SOURCE",

        error_message:
          message,

        metadata: {
          reason:
            "No active monitoring source configured.",
        },

        started_at:
          nowIso,

        finished_at:
          new Date()
            .toISOString(),
      });

    await supabase
      .from(
        "casino"
      )
      .update({
        monitoring_status:
          "needs_review",

        last_checked_at:
          nowIso,

        next_check_at:
          nextCheckIso,

        last_monitoring_error:
          message,
      })
      .eq(
        "id",
        casino.id
      );

    if (
      casino
        .monitoring_alerts_enabled !==
      false
    ) {
      await createOrUpdateOpenAlert(
        supabase,
        {
          casinoId:
            casino.id,

          sourceId:
            null,

          alertType:
            "source_inaccessible",

          severity:
            "warning",

          title:
            `${casino.name}: monitoring source required`,

          message,

          dedupeKey:
            `casino:${casino.id}:no-monitoring-source`,

          details: {
            casino:
              casino.name,
          },
        }
      );
    }

    return {
      success:
        false,
      status:
        "needs_review",
      message,
    };
  }

  let successfulSources =
    0;

  let changedSources =
    0;

  let failedSources =
    0;

  let reviewRequiredSources =
    0;

  let aiRuns =
    0;

  let appliedChanges =
    0;

  const errors:
    string[] =
    [];

  for (
    const source
    of sources
  ) {
    const startedAt =
      new Date()
        .toISOString();

    if (
      source
        .monitoring_mode ===
      "paused"
    ) {
      await supabase
        .from(
          "monitoring_run"
        )
        .insert({
          casino_id:
            casino.id,

          source_id:
            source.id,

          status:
            "paused",

          attempt_count:
            1,

          records_checked:
            0,

          changes_detected:
            0,

          changes_applied:
            0,

          ai_used:
            false,

          metadata: {
            source_type:
              source.source_type,
          },

          started_at:
            startedAt,

          finished_at:
            new Date()
              .toISOString(),
        });

      continue;
    }

    const sourceUrl =
      String(
        source.source_url ??
          ""
      ).trim();

    if (
      !sourceUrl
    ) {
      failedSources++;

      const message =
        "Monitoring source URL is empty.";

      errors.push(
        `${
          source.source_name ??
          source.source_type
        }: ${message}`
      );

      await supabase
        .from(
          "casino_monitor_source"
        )
        .update({
          last_checked_at:
            nowIso,

          next_check_at:
            nextCheckIso,

          consecutive_failures:
            Number(
              source.consecutive_failures ??
                0
            ) +
            1,

          retry_count:
            0,

          last_error:
            message,

          updated_at:
            nowIso,
        })
        .eq(
          "id",
          source.id
        );

      await supabase
        .from(
          "monitoring_run"
        )
        .insert({
          casino_id:
            casino.id,

          source_id:
            source.id,

          status:
            "failed",

          attempt_count:
            1,

          records_checked:
            0,

          changes_detected:
            0,

          changes_applied:
            0,

          ai_used:
            false,

          error_code:
            "EMPTY_URL",

          error_message:
            message,

          started_at:
            startedAt,

          finished_at:
            new Date()
              .toISOString(),
        });

      if (
        casino
          .monitoring_alerts_enabled !==
        false
      ) {
        await createOrUpdateOpenAlert(
          supabase,
          {
            casinoId:
              casino.id,

            sourceId:
              source.id,

            alertType:
              "source_inaccessible",

            severity:
              "warning",

            title:
              `${casino.name}: source URL missing`,

            message,

            dedupeKey:
              `source:${source.id}:empty-url`,
          }
        );
      }

      continue;
    }

    const validatedUrl =
      validateMonitoringUrl(
        sourceUrl
      );

    if (
      !validatedUrl.valid ||
      !validatedUrl.url
    ) {
      failedSources++;

      const message =
        validatedUrl.reason ??
        "Invalid monitoring URL.";

      errors.push(
        message
      );

      await supabase
        .from(
          "casino_monitor_source"
        )
        .update({
          last_checked_at:
            nowIso,

          next_check_at:
            nextCheckIso,

          consecutive_failures:
            Number(
              source.consecutive_failures ??
                0
            ) +
            1,

          last_error:
            message,

          updated_at:
            nowIso,
        })
        .eq(
          "id",
          source.id
        );

      await supabase
        .from(
          "monitoring_run"
        )
        .insert({
          casino_id:
            casino.id,

          source_id:
            source.id,

          status:
            "failed",

          attempt_count:
            1,

          records_checked:
            0,

          changes_detected:
            0,

          changes_applied:
            0,

          ai_used:
            false,

          error_code:
            "INVALID_URL",

          error_message:
            message,

          started_at:
            startedAt,

          finished_at:
            new Date()
              .toISOString(),
        });

      continue;
    }

    try {
      const result =
        await fetchMonitoringSource(
          validatedUrl.url,
          retryLimit
        );

      const responseText =
        normalizeMonitoringText(
          result.body
        );

      const newHash =
        createContentHash(
          responseText
        );

      const oldHash =
        source.content_hash;

      const changed =
        Boolean(
          oldHash &&
            oldHash !==
              newHash
        );

      if (
        !result.success
      ) {
        failedSources++;

        const message =
          `HTTP ${result.status} ${result.statusText}`.trim();

        errors.push(
          `${
            source.source_name ??
            source.source_type
          }: ${message}`
        );

        const confirmedAccessFailure =
          result.status ===
            401 ||
          result.status ===
            403 ||
          result.status ===
            451;

        await supabase
          .from(
            "casino_monitor_source"
          )
          .update({
            last_checked_at:
              nowIso,

            next_check_at:
              nextCheckIso,

            consecutive_failures:
              Number(
                source.consecutive_failures ??
                  0
              ) +
              1,

            retry_count:
              Math.max(
                0,
                result.attempt -
                  1
              ),

            confirmed_inaccessible:
              confirmedAccessFailure,

            last_error:
              message,

            updated_at:
              nowIso,
          })
          .eq(
            "id",
            source.id
          );

        await supabase
          .from(
            "monitoring_run"
          )
          .insert({
            casino_id:
              casino.id,

            source_id:
              source.id,

            status:
              "failed",

            attempt_count:
              result.attempt,

            records_checked:
              1,

            changes_detected:
              0,

            changes_applied:
              0,

            ai_used:
              false,

            error_code:
              `HTTP_${result.status}`,

            error_message:
              message,

            metadata: {
              url:
                validatedUrl.url,

              status:
                result.status,
            },

            started_at:
              startedAt,

            finished_at:
              new Date()
                .toISOString(),
          });

        if (
          casino
            .monitoring_alerts_enabled !==
          false
        ) {
          await createOrUpdateOpenAlert(
            supabase,
            {
              casinoId:
                casino.id,

              sourceId:
                source.id,

              alertType:
                confirmedAccessFailure
                  ? "access_failure"
                  : "source_inaccessible",

              severity:
                "warning",

              title:
                `${casino.name}: monitoring source unavailable`,

              message:
                `Nivaro could not verify this source. ${message}`,

              dedupeKey:
                `source:${source.id}:http:${result.status}`,

              details: {
                source_url:
                  validatedUrl.url,

                http_status:
                  result.status,
              },
            }
          );
        }

        continue;
      }

      successfulSources++;

      await supabase
        .from(
          "casino_monitor_source"
        )
        .update({
          content_hash:
            newHash,

          etag:
            result.etag,

          last_modified:
            result.lastModified,

          last_checked_at:
            nowIso,

          last_successful_at:
            nowIso,

          next_check_at:
            nextCheckIso,

          consecutive_failures:
            0,

          retry_count:
            Math.max(
              0,
              result.attempt -
                1
            ),

          confirmed_inaccessible:
            false,

          access_alert_sent:
            false,

          paused_reason:
            null,

          last_error:
            null,

          updated_at:
            nowIso,
        })
        .eq(
          "id",
          source.id
        );

      if (
        !oldHash
      ) {
        await supabase
          .from(
            "monitoring_run"
          )
          .insert({
            casino_id:
              casino.id,

            source_id:
              source.id,

            status:
              "success",

            attempt_count:
              result.attempt,

            records_checked:
              1,

            changes_detected:
              0,

            changes_applied:
              0,

            ai_used:
              false,

            metadata: {
              source_type:
                source.source_type,

              baseline_created:
                true,

              source_url:
                validatedUrl.url,
            },

            started_at:
              startedAt,

            finished_at:
              new Date()
                .toISOString(),
          });

        continue;
      }

      if (
        changed
      ) {
        const analysis =
          await analyzeMonitoringContentWithAI(
            casino,
            source,
            responseText
          );

        if (
          analysis.used
        ) {
          aiRuns++;
        }

        if (
          !analysis.used
        ) {
          changedSources++;
          reviewRequiredSources++;

          await supabase
            .from(
              "monitoring_run"
            )
            .insert({
              casino_id:
                casino.id,

              source_id:
                source.id,

              status:
                "changed",

              attempt_count:
                result.attempt,

              records_checked:
                1,

              changes_detected:
                1,

              changes_applied:
                0,

              ai_used:
                false,

              error_code:
                analysis.error
                  ? "AI_ANALYSIS_FAILED"
                  : "AI_NOT_CONFIGURED",

              error_message:
                analysis.reason ||
                null,

              metadata: {
                source_type:
                  source.source_type,

                source_url:
                  validatedUrl.url,

                previous_hash:
                  oldHash,

                current_hash:
                  newHash,

                ai_summary:
                  analysis.summary,
              },

              started_at:
                startedAt,

              finished_at:
                new Date()
                  .toISOString(),
            });

          if (
            casino
              .monitoring_alerts_enabled !==
            false
          ) {
            await createOrUpdateOpenAlert(
              supabase,
              {
                casinoId:
                  casino.id,

                sourceId:
                  source.id,

                alertType:
                  "possible_change",

                severity:
                  "warning",

                title:
                  `${casino.name}: source changed — AI review unavailable`,

                message:
                  `${analysis.summary} ${analysis.reason ?? ""}`.trim(),

                dedupeKey:
                  `source:${source.id}:ai-unavailable:${newHash}`,

                details: {
                  source_type:
                    source.source_type,

                  source_url:
                    validatedUrl.url,

                  ai_error:
                    analysis.error ??
                    null,
                },
              }
            );
          }

          continue;
        }

        if (
          analysis.changes.length ===
          0 &&
          analysis.offers.length === 0
        ) {
          if (
            analysis.requires_review
          ) {
            reviewRequiredSources++;

            if (
              casino
                .monitoring_alerts_enabled !==
              false
            ) {
              await createOrUpdateOpenAlert(
                supabase,
                {
                  casinoId:
                    casino.id,

                  sourceId:
                    source.id,

                  alertType:
                    "possible_change",

                  severity:
                    "info",

                  title:
                    `${casino.name}: source changed — manual review suggested`,

                  message:
                    `${analysis.summary} ${analysis.reason ?? ""}`.trim(),

                  dedupeKey:
                    `source:${source.id}:ai-review:${newHash}`,

                  details: {
                    source_type:
                      source.source_type,

                    source_url:
                      validatedUrl.url,

                    ai_model:
                      analysis.model ??
                      null,

                    ai_confidence:
                      analysis.confidence,
                  },
                }
              );
            }
          }

          await supabase
            .from(
              "monitoring_run"
            )
            .insert({
              casino_id:
                casino.id,

              source_id:
                source.id,

              status:
                analysis.requires_review
                  ? "partial"
                  : "no_change",

              attempt_count:
                result.attempt,

              records_checked:
                1,

              changes_detected:
                0,

              changes_applied:
                0,

              ai_used:
                true,

              metadata: {
                source_type:
                  source.source_type,

                source_url:
                  validatedUrl.url,

                content_hash_changed:
                  true,

                previous_hash:
                  oldHash,

                current_hash:
                  newHash,

                ai_model:
                  analysis.model ??
                  null,

                ai_confidence:
                  analysis.confidence,

                ai_summary:
                  analysis.summary,

                ai_reason:
                  analysis.reason ??
                  null,
              },

              started_at:
                startedAt,

              finished_at:
                new Date()
                  .toISOString(),
            });

          continue;
        }

        changedSources++;

        let applicationResult = {
          applied:
            [] as AIFieldChange[],
          review:
            analysis.changes,
        };

        try {
          applicationResult =
            await applyVerifiedAIChanges(
              supabase,
              casino,
              source,
              settings,
              analysis
            );
        } catch (
          applyError
        ) {
          const applyMessage =
            applyError instanceof
            Error
              ? applyError.message
              : "AI verified changes could not be applied.";

          errors.push(
            applyMessage
          );

          reviewRequiredSources++;

          applicationResult = {
            applied:
              [],
            review:
              analysis.changes,
          };
        }

        let offerSyncResult = { applied: [] as AIOfferSnapshot[], review: analysis.offers };
        try {
          offerSyncResult = await syncVerifiedOffersFromAI(supabase, casino, source, settings, analysis);
        } catch (offerError) {
          errors.push(offerError instanceof Error ? offerError.message : "AI verified offers could not be synchronized.");
          reviewRequiredSources++;
        }

        appliedChanges +=
          applicationResult.applied.length + offerSyncResult.applied.length;

        const requiresManualReview =
          analysis.requires_review ||
          applicationResult.review.length > 0 ||
          offerSyncResult.review.length > 0;

        if (
          requiresManualReview
        ) {
          reviewRequiredSources++;
        }

        await supabase
          .from(
            "monitoring_run"
          )
          .insert({
            casino_id:
              casino.id,

            source_id:
              source.id,

            status:
              applicationResult.applied.length + offerSyncResult.applied.length > 0 &&
              !requiresManualReview
                ? "changed"
                : "partial",

            attempt_count:
              result.attempt,

            records_checked:
              1,

            changes_detected:
              analysis.changes.length + analysis.offers.length,

            changes_applied:
              applicationResult.applied.length + offerSyncResult.applied.length,

            ai_used:
              true,

            metadata: {
              source_type:
                source.source_type,

              source_url:
                validatedUrl.url,

              previous_hash:
                oldHash,

              current_hash:
                newHash,

              ai_model:
                analysis.model ??
                null,

              ai_confidence:
                analysis.confidence,

              ai_summary:
                analysis.summary,

              ai_offers_detected:
                analysis.offers,

              ai_offers_applied:
                offerSyncResult.applied,

              ai_reason:
                analysis.reason ??
                null,

              detected_changes:
                analysis.changes,

              applied_changes:
                applicationResult
                  .applied,

              review_changes:
                applicationResult
                  .review,
            },

            started_at:
              startedAt,

            finished_at:
              new Date()
                .toISOString(),
          });

        if (
          casino
            .monitoring_alerts_enabled !==
          false
        ) {
          if (
            requiresManualReview
          ) {
            await createOrUpdateOpenAlert(
              supabase,
              {
                casinoId:
                  casino.id,

                sourceId:
                  source.id,

                alertType:
                  "possible_change",

                severity:
                  "warning",

                title:
                  `${casino.name}: AI detected changes requiring review`,

                message:
                  `${analysis.summary} ${analysis.reason ?? ""}`.trim(),

                dedupeKey:
                  `source:${source.id}:ai-review-change:${newHash}`,

                details: {
                  source_url:
                    validatedUrl.url,

                  ai_model:
                    analysis.model ??
                    null,

                  ai_confidence:
                    analysis.confidence,

                  detected_changes:
                    analysis.changes,

                  review_changes:
                    applicationResult
                      .review,

                  applied_changes:
                    applicationResult
                      .applied,
                },
              }
            );
          } else if (
            applicationResult
              .applied.length >
            0
          ) {
            await createOrUpdateOpenAlert(
              supabase,
              {
                casinoId:
                  casino.id,

                sourceId:
                  source.id,

                alertType:
                  "bonus_changed",

                severity:
                  "info",

                title:
                  `${casino.name}: verified public data updated automatically`,

                message:
                  analysis.summary,

                dedupeKey:
                  `source:${source.id}:ai-applied:${newHash}`,

                details: {
                  source_url:
                    validatedUrl.url,

                  ai_model:
                    analysis.model ??
                    null,

                  ai_confidence:
                    analysis.confidence,

                  applied_changes:
                    applicationResult
                      .applied,
                },
              }
            );
          }
        }

        continue;
      }

      await supabase
        .from(
          "monitoring_run"
        )
        .insert({
          casino_id:
            casino.id,

          source_id:
            source.id,

          status:
            "no_change",

          attempt_count:
            result.attempt,

          records_checked:
            1,

          changes_detected:
            0,

          changes_applied:
            0,

          ai_used:
            false,

          metadata: {
            source_type:
              source.source_type,

            source_url:
              validatedUrl.url,
          },

          started_at:
            startedAt,

          finished_at:
            new Date()
              .toISOString(),
        });
    } catch (
      error
    ) {
      failedSources++;

      const message =
        error instanceof
        Error
          ? error.message
          : "Unknown monitoring request error.";

      errors.push(
        `${
          source.source_name ??
          source.source_type
        }: ${message}`
      );

      await supabase
        .from(
          "casino_monitor_source"
        )
        .update({
          last_checked_at:
            nowIso,

          next_check_at:
            nextCheckIso,

          consecutive_failures:
            Number(
              source.consecutive_failures ??
                0
            ) +
            1,

          last_error:
            message,

          updated_at:
            nowIso,
        })
        .eq(
          "id",
          source.id
        );

      await supabase
        .from(
          "monitoring_run"
        )
        .insert({
          casino_id:
            casino.id,

          source_id:
            source.id,

          status:
            "failed",

          attempt_count:
            Math.max(
              1,
              retryLimit +
                1
            ),

          records_checked:
            0,

          changes_detected:
            0,

          changes_applied:
            0,

          ai_used:
            false,

          error_code:
            "FETCH_ERROR",

          error_message:
            message,

          metadata: {
            source_url:
              source.source_url,
          },

          started_at:
            startedAt,

          finished_at:
            new Date()
              .toISOString(),
        });

      if (
        casino
          .monitoring_alerts_enabled !==
        false
      ) {
        await createOrUpdateOpenAlert(
          supabase,
          {
            casinoId:
              casino.id,

            sourceId:
              source.id,

            alertType:
              "monitoring_failed",

            severity:
              "warning",

            title:
              `${casino.name}: monitoring request failed`,

            message,

            dedupeKey:
              `source:${source.id}:fetch-error`,

            details: {
              source_url:
                source.source_url,
            },
          }
        );
      }
    }
  }

  let finalStatus =
    "healthy";

  if (
    successfulSources ===
    0
  ) {
    finalStatus =
      "needs_review";
  } else if (
    failedSources >
    0
  ) {
    finalStatus =
      "needs_review";
  } else if (
    reviewRequiredSources >
    0
  ) {
    finalStatus =
      "needs_review";
  }

  const lastError =
    errors.length >
    0
      ? errors.join(
          " | "
        )
      : null;

  await supabase
    .from(
      "casino"
    )
    .update({
      monitoring_status:
        finalStatus,

      last_checked_at:
        nowIso,

      last_successful_check_at:
        successfulSources >
        0
          ? nowIso
          : null,

      next_check_at:
        nextCheckIso,

      last_monitoring_error:
        lastError,

      updated_at:
        new Date()
          .toISOString(),
    })
    .eq(
      "id",
      casino.id
    );

  return {
    success:
      successfulSources >
      0,

    status:
      finalStatus,

    successfulSources,

    changedSources,

    failedSources,

    reviewRequiredSources,

    aiRuns,

    appliedChanges,

    nextCheckAt:
      nextCheckIso,

    errors,
  };
}


/* ============================================================
   RUN CHECK NOW — ONE CASINO
============================================================ */

export async function runCasinoMonitoringCheck(
  formData: FormData
) {
  try {
    const supabase =
      await getAdminClient();

    const casinoId =
      String(
        formData.get(
          "casino_id"
        ) ?? ""
      ).trim();

    if (
      !casinoId
    ) {
      return {
        error:
          "Casino ID is required.",
      };
    }

    const {
      data:
        settingsData,
      error:
        settingsError,
    } =
      await supabase
        .from(
          "automation_settings"
        )
        .select("*")
        .eq(
          "singleton_key",
          "global"
        )
        .maybeSingle();

    if (
      settingsError
    ) {
      return {
        error:
          settingsError.message,
      };
    }

    const settings =
      (
        settingsData ??
        {}
      ) as AutomationSettings;

    if (
      settings
        .global_monitoring_enabled ===
      false
    ) {
      return {
        error:
          "Global monitoring is currently disabled.",
      };
    }

    const {
      data:
        casinoData,
      error:
        casinoError,
    } =
      await supabase
        .from(
          "casino"
        )
        .select(`
          id,
          name,
          slug,
          active,
          official_url,
          welcome_bonus,
          no_deposit,
          no_deposit_bonus,
          free_spins,
          free_spins_count,
          free_spins_details,
          cashback,
          min_deposit,
          payout_speed,
          withdrawal_limits,
          monitoring_mode,
          monitoring_enabled,
          auto_update_enabled,
          monitoring_alerts_enabled
        `)
        .eq(
          "id",
          casinoId
        )
        .maybeSingle();

    if (
      casinoError
    ) {
      return {
        error:
          casinoError.message,
      };
    }

    if (
      !casinoData
    ) {
      return {
        error:
          "Casino was not found.",
      };
    }

    const result =
      await executeCasinoMonitoringCheck(
        supabase,
        casinoData as CasinoForMonitoring,
        settings
      );

    revalidatePath(
      "/admin/monitoring"
    );

    revalidatePath(
      "/admin/casinos"
    );

    return {
      success:
        true,

      result,
    };
  } catch (
    error
  ) {
    return {
      error:
        error instanceof
        Error
          ? error.message
          : "Casino monitoring check failed.",
    };
  }
}


/* ============================================================
   RUN ALL CHECKS NOW
============================================================ */

export async function runAllMonitoringChecks() {
  try {
    const supabase =
      await getAdminClient();

    const {
      data:
        settingsData,
      error:
        settingsError,
    } =
      await supabase
        .from(
          "automation_settings"
        )
        .select("*")
        .eq(
          "singleton_key",
          "global"
        )
        .maybeSingle();

    if (
      settingsError
    ) {
      return {
        error:
          settingsError.message,
      };
    }

    const settings =
      (
        settingsData ??
        {}
      ) as AutomationSettings;

    if (
      settings
        .global_monitoring_enabled ===
      false
    ) {
      return {
        error:
          "Global monitoring is currently disabled.",
      };
    }

    const {
      data:
        casinosData,
      error:
        casinosError,
    } =
      await supabase
        .from(
          "casino"
        )
        .select(`
          id,
          name,
          slug,
          active,
          official_url,
          welcome_bonus,
          no_deposit,
          no_deposit_bonus,
          free_spins,
          free_spins_count,
          free_spins_details,
          cashback,
          min_deposit,
          payout_speed,
          withdrawal_limits,
          monitoring_mode,
          monitoring_enabled,
          auto_update_enabled,
          monitoring_alerts_enabled
        `)
        .eq(
          "active",
          true
        )
        .eq(
          "monitoring_enabled",
          true
        )
        .eq(
          "monitoring_mode",
          "automatic"
        )
        .order(
          "name"
        );

    if (
      casinosError
    ) {
      return {
        error:
          casinosError.message,
      };
    }

    const casinos =
      (
        casinosData ??
        []
      ) as CasinoForMonitoring[];

    const results:
      Array<{
        casinoId:
          string;
        casinoName:
          string;
        result?:
          unknown;
        error?:
          string;
      }> =
      [];

    for (
      const casino
      of casinos
    ) {
      try {
        const result =
          await executeCasinoMonitoringCheck(
            supabase,
            casino,
            settings
          );

        results.push({
          casinoId:
            casino.id,

          casinoName:
            casino.name,

          result,
        });
      } catch (
        error
      ) {
        results.push({
          casinoId:
            casino.id,

          casinoName:
            casino.name,

          error:
            error instanceof
            Error
              ? error.message
              : "Monitoring check failed.",
        });
      }
    }

    revalidatePath(
      "/admin/monitoring"
    );

    revalidatePath(
      "/admin/casinos"
    );

    return {
      success:
        true,

      checked:
        casinos.length,

      results,
    };
  } catch (
    error
  ) {
    return {
      error:
        error instanceof
        Error
          ? error.message
          : "Failed to run monitoring checks.",
    };
  }
}


/* ============================================================
   SCHEDULED / CRON MONITORING
============================================================ */

export async function runScheduledMonitoringChecks() {
  const supabase =
    await createSupabaseServiceClient();

  if (
    !supabase
  ) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing."
    );
  }

  const {
    data:
      settingsData,
    error:
      settingsError,
  } =
    await supabase
      .from(
        "automation_settings"
      )
      .select("*")
      .eq(
        "singleton_key",
        "global"
      )
      .maybeSingle();

  if (
    settingsError
  ) {
    throw new Error(
      settingsError.message
    );
  }

  const settings =
    (
      settingsData ??
      {}
    ) as AutomationSettings;

  if (
    settings
      .global_monitoring_enabled ===
    false
  ) {
    return {
      success:
        true,
      skipped:
        true,
      reason:
        "Global monitoring is disabled.",
      checked:
        0,
      results:
        [],
    };
  }

  const nowIso =
    new Date()
      .toISOString();

  const {
    data:
      casinosData,
    error:
      casinosError,
  } =
    await supabase
      .from(
        "casino"
      )
      .select(`
        id,
        name,
        slug,
        active,
        official_url,
        welcome_bonus,
        no_deposit,
        no_deposit_bonus,
        free_spins,
        free_spins_count,
        free_spins_details,
        cashback,
        min_deposit,
        payout_speed,
        withdrawal_limits,
        monitoring_mode,
        monitoring_enabled,
        auto_update_enabled,
        monitoring_alerts_enabled,
        next_check_at
      `)
      .eq(
        "active",
        true
      )
      .eq(
        "monitoring_enabled",
        true
      )
      .eq(
        "monitoring_mode",
        "automatic"
      )
      .or(
        `next_check_at.is.null,next_check_at.lte.${nowIso}`
      )
      .order(
        "name"
      );

  if (
    casinosError
  ) {
    throw new Error(
      casinosError.message
    );
  }

  const casinos =
    (
      casinosData ??
      []
    ) as Array<
      CasinoForMonitoring & {
        next_check_at?:
          string |
          null;
      }
    >;

  const results:
    Array<{
      casinoId:
        string;
      casinoName:
        string;
      result?:
        unknown;
      error?:
        string;
    }> =
    [];

  for (
    const casino
    of casinos
  ) {
    try {
      const result =
        await executeCasinoMonitoringCheck(
          supabase,
          casino,
          settings
        );

      results.push({
        casinoId:
          casino.id,

        casinoName:
          casino.name,

        result,
      });
    } catch (
      error
    ) {
      results.push({
        casinoId:
          casino.id,

        casinoName:
          casino.name,

        error:
          error instanceof
          Error
            ? error.message
            : "Scheduled monitoring check failed.",
      });
    }
  }

  return {
    success:
      true,
    skipped:
      false,
    checked:
      casinos.length,
    results,
  };
}


/* ============================================================
   RESOLVE MONITORING ALERT
============================================================ */

export async function resolveMonitoringAlert(
  formData: FormData
) {
  try {
    const supabase =
      await getAdminClient();

    const alertId =
      String(
        formData.get(
          "alert_id"
        ) ??
          ""
      ).trim();

    if (
      !alertId
    ) {
      return {
        error:
          "Alert ID is required.",
      };
    }

    const {
      error,
    } =
      await supabase
        .from(
          "monitoring_alert"
        )
        .update({
          status:
            "resolved",

          resolved_at:
            new Date()
              .toISOString(),

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          alertId
        );

    if (
      error
    ) {
      return {
        error:
          error.message,
      };
    }

    revalidatePath(
      "/admin/monitoring"
    );

    return {
      success:
        true,
    };
  } catch (
    error
  ) {
    return {
      error:
        error instanceof
        Error
          ? error.message
          : "Failed to resolve monitoring alert.",
    };
  }
}