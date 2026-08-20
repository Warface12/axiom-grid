"use server";

import { createHash } from "crypto";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getSearchConsoleOpportunities } from "@/lib/actions/searchConsole";

type SeoTargetType = "casino" | "bonus" | "guide" | "site";

type SeoChange = {
  target_type: SeoTargetType;
  target_id: string | null;
  target_key: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  confidence: number;
  reason: string;
  auto_apply: boolean;
};

type SeoCandidate = {
  target_type: SeoTargetType;
  target_id: string | null;
  target_key: string;
  title: string;
  url_path: string;
  current_title: string | null;
  current_description: string | null;
  body_excerpt: string;
  country_codes?: string[];
  active?: boolean;
};

const GEMINI_TIMEOUT_MS = 30_000;
const GEMINI_MAX_ATTEMPTS = 3;
const SEO_AUTO_APPLY_CONFIDENCE = 0.96;
const SEO_MAX_ITEMS_PER_RUN = 30;
const SEO_MAX_BODY_CHARS = 3_500;

function cleanText(value: unknown, max = 10_000): string | null {
  if (typeof value !== "string") return null;
  const clean = value.replace(/\s+/g, " ").trim();
  return clean ? clean.slice(0, max) : null;
}

function clampConfidence(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

function contentHash(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

function normalizeSeoTitle(value: unknown) {
  return cleanText(value, 65);
}

function normalizeSeoDescription(value: unknown) {
  return cleanText(value, 165);
}

function isReasonableTitle(value: string | null) {
  if (!value) return false;
  const length = value.trim().length;
  return length >= 20 && length <= 65;
}

function isReasonableDescription(value: string | null) {
  if (!value) return false;
  const length = value.trim().length;
  return length >= 70 && length <= 165;
}

function extractGeminiText(payload: any) {
  const parts =
    payload?.candidates?.[0]?.content?.parts ?? [];

  if (!Array.isArray(parts)) return "";

  return parts
    .map((part: any) =>
      typeof part?.text === "string" ? part.text : ""
    )
    .filter(Boolean)
    .join("\n")
    .trim();
}

function parseJson(value: string) {
  const trimmed = value.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }

    throw new Error("Gemini returned invalid JSON.");
  }
}

function isRetryableStatus(status: number) {
  return [408, 429, 500, 502, 503, 504].includes(status);
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiSeo(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const model =
    process.env.GEMINI_SEO_MODEL?.trim() ||
    process.env.GEMINI_MODEL?.trim() ||
    "gemini-3.5-flash-lite";

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      GEMINI_TIMEOUT_MS
    );

    try {
      const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model
        )}:generateContent`;

      const response = await fetch(endpoint, {
        method: "POST",
        signal: controller.signal,
        cache: "no-store",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
            maxOutputTokens: 4096,
          },
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok) {
        const text = extractGeminiText(payload);

        if (!text) {
          throw new Error("Gemini returned an empty SEO response.");
        }

        return {
          model,
          parsed: parseJson(text),
        };
      }

      const message =
        payload?.error?.message ||
        `Gemini API returned HTTP ${response.status}.`;

      const error = new Error(message);

      if (
        !isRetryableStatus(response.status) ||
        attempt === GEMINI_MAX_ATTEMPTS
      ) {
        throw error;
      }

      lastError = error;

      await sleep(
        Math.min(750 * 2 ** (attempt - 1), 5000)
      );
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error("Unknown Gemini SEO error.");

      if (attempt === GEMINI_MAX_ATTEMPTS) {
        throw lastError;
      }

      await sleep(
        Math.min(750 * 2 ** (attempt - 1), 5000)
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error("Gemini SEO request failed.");
}

async function collectSeoCandidates(supabase: any): Promise<SeoCandidate[]> {
  const candidates: SeoCandidate[] = [];

  const {
    data: casinos,
    error: casinoError,
  } = await supabase
    .from("casino")
    .select(`
      id,
      name,
      slug,
      description,
      review_content,
      seo_title,
      seo_description,
      country_codes,
      active,
      visible
    `)
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (casinoError) {
    throw new Error(`Casino SEO load failed: ${casinoError.message}`);
  }

  for (const casino of casinos ?? []) {
    if (casino.visible === false) continue;

    const body = [
      casino.description,
      casino.review_content,
    ]
      .filter(Boolean)
      .join(" ");

    candidates.push({
      target_type: "casino",
      target_id: casino.id,
      target_key: `casino:${casino.id}`,
      title: casino.name,
      url_path: `/casinos/${casino.slug}`,
      current_title: casino.seo_title,
      current_description: casino.seo_description,
      body_excerpt: body.slice(0, SEO_MAX_BODY_CHARS),
      country_codes: Array.isArray(casino.country_codes)
        ? casino.country_codes
        : [],
      active: true,
    });
  }

  const {
    data: bonuses,
    error: bonusError,
  } = await supabase
    .from("bonus")
    .select(`
      id,
      slug,
      title,
      amount,
      free_spins,
      terms,
      seo_title,
      seo_description,
      active,
      status
    `)
    .eq("active", true)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (!bonusError) {
    for (const bonus of bonuses ?? []) {
      const body = [
        bonus.amount,
        bonus.free_spins,
        bonus.terms,
      ]
        .filter(Boolean)
        .join(" ");

      candidates.push({
        target_type: "bonus",
        target_id: bonus.id,
        target_key: `bonus:${bonus.id}`,
        title: bonus.title,
        url_path: `/bonuses/${bonus.slug}`,
        current_title: bonus.seo_title,
        current_description: bonus.seo_description,
        body_excerpt: body.slice(0, SEO_MAX_BODY_CHARS),
        active: true,
      });
    }
  }

  const {
    data: guides,
    error: guideError,
  } = await supabase
    .from("guide")
    .select(`
      id,
      slug,
      title,
      excerpt,
      content,
      seo_title,
      seo_description,
      published
    `)
    .eq("published", true)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (!guideError) {
    for (const guide of guides ?? []) {
      const body = [
        guide.excerpt,
        guide.content,
      ]
        .filter(Boolean)
        .join(" ");

      candidates.push({
        target_type: "guide",
        target_id: guide.id,
        target_key: `guide:${guide.id}`,
        title: guide.title,
        url_path: `/guides/${guide.slug}`,
        current_title: guide.seo_title,
        current_description: guide.seo_description,
        body_excerpt: body.slice(0, SEO_MAX_BODY_CHARS),
        active: true,
      });
    }
  }

  const {
    data: settings,
    error: settingsError,
  } = await supabase
    .from("seo_settings")
    .select(`
      id,
      page_key,
      title,
      description,
      canonical_path,
      no_index
    `)
    .eq("no_index", false)
    .limit(30);

  if (!settingsError) {
    for (const item of settings ?? []) {
      candidates.push({
        target_type: "site",
        target_id: item.id,
        target_key: `site:${item.page_key}`,
        title: item.page_key,
        url_path: item.canonical_path || "/",
        current_title: item.title,
        current_description: item.description,
        body_excerpt: "",
        active: true,
      });
    }
  }

  return candidates;
}

function scoreSeoNeed(candidate: SeoCandidate) {
  let score = 0;

  if (!candidate.current_title) score += 10;
  else if (!isReasonableTitle(candidate.current_title)) score += 5;

  if (!candidate.current_description) score += 10;
  else if (!isReasonableDescription(candidate.current_description)) score += 5;

  if (candidate.body_excerpt.length < 120) score += 2;

  return score;
}

async function analyzeCandidateWithGemini(
  candidate: SeoCandidate
): Promise<{
  model: string;
  change: SeoChange | null;
}> {
  const prompt = `You are NivaroBet's SEO optimization engine.

Your task is to improve ONLY safe on-page SEO metadata for one existing public page.

STRICT RULES:
- Do not invent casino facts, bonuses, licenses, countries, payment methods, providers, or claims.
- Use only the supplied page data.
- Never promise rankings, winnings, safety, legality, or guaranteed results.
- Keep SEO title natural and useful, ideally 35-60 characters, hard maximum 65.
- Keep meta description natural and useful, ideally 110-155 characters, hard maximum 165.
- Avoid keyword stuffing.
- Avoid fake urgency and fake exclusivity.
- Preserve the NivaroBet brand naturally when useful.
- If the current metadata is already strong, return action="none".
- Only recommend an automatic update when the improvement is clearly better and factually safe.
- confidence must be between 0 and 1.
- Return only valid JSON.

JSON:
{
  "action": "update" | "none" | "review",
  "seo_title": string | null,
  "seo_description": string | null,
  "confidence": number,
  "reason": string
}

PAGE TYPE:
${candidate.target_type}

PAGE NAME:
${candidate.title}

URL PATH:
${candidate.url_path}

COUNTRY CODES:
${JSON.stringify(candidate.country_codes ?? [])}

CURRENT SEO TITLE:
${candidate.current_title ?? ""}

CURRENT META DESCRIPTION:
${candidate.current_description ?? ""}

PUBLIC PAGE EXCERPT:
${candidate.body_excerpt}`;

  const {
    model,
    parsed,
  } = await callGeminiSeo(prompt);

  const action = String(parsed?.action ?? "none");
  const confidence = clampConfidence(parsed?.confidence);

  if (action === "none") {
    return { model, change: null };
  }

  const seoTitle = normalizeSeoTitle(parsed?.seo_title);
  const seoDescription =
    normalizeSeoDescription(parsed?.seo_description);

  if (!seoTitle && !seoDescription) {
    return { model, change: null };
  }

  const oldCombined = JSON.stringify({
    seo_title: candidate.current_title,
    seo_description: candidate.current_description,
  });

  const newCombined = JSON.stringify({
    seo_title: seoTitle ?? candidate.current_title,
    seo_description:
      seoDescription ?? candidate.current_description,
  });

  if (oldCombined === newCombined) {
    return { model, change: null };
  }

  return {
    model,
    change: {
      target_type: candidate.target_type,
      target_id: candidate.target_id,
      target_key: candidate.target_key,
      field: "metadata",
      old_value: oldCombined,
      new_value: newCombined,
      confidence,
      reason: cleanText(parsed?.reason, 600) ?? "SEO metadata improvement.",
      auto_apply:
        action === "update" &&
        confidence >= SEO_AUTO_APPLY_CONFIDENCE &&
        Boolean(seoTitle || seoDescription),
    },
  };
}

async function applySeoChange(
  supabase: any,
  candidate: SeoCandidate,
  change: SeoChange
) {
  const parsed = JSON.parse(change.new_value ?? "{}");

  const updatePayload: Record<string, unknown> = {};

  if (parsed.seo_title) {
    updatePayload[
      candidate.target_type === "site" ? "title" : "seo_title"
    ] = parsed.seo_title;
  }

  if (parsed.seo_description) {
    updatePayload[
      candidate.target_type === "site"
        ? "description"
        : "seo_description"
    ] = parsed.seo_description;
  }

  updatePayload.updated_at = new Date().toISOString();

  const table =
    candidate.target_type === "casino"
      ? "casino"
      : candidate.target_type === "bonus"
        ? "bonus"
        : candidate.target_type === "guide"
          ? "guide"
          : "seo_settings";

  if (!candidate.target_id) {
    throw new Error(`Missing target id for ${candidate.target_key}.`);
  }

  const { error } = await supabase
    .from(table)
    .update(updatePayload)
    .eq("id", candidate.target_id);

  if (error) {
    throw new Error(
      `SEO update failed for ${candidate.target_key}: ${error.message}`
    );
  }

  return updatePayload;
}

async function logSeoRun(
  supabase: any,
  payload: Record<string, unknown>
) {
  const { error } = await supabase
    .from("seo_automation_run")
    .insert(payload);

  if (error) {
    console.error("SEO run log failed:", error.message);
  }
}

async function logSeoChange(
  supabase: any,
  change: SeoChange,
  model: string,
  status: "applied" | "needs_review" | "skipped"
) {
  const { error } = await supabase
    .from("seo_automation_change")
    .insert({
      target_type: change.target_type,
      target_id: change.target_id,
      target_key: change.target_key,
      field_name: change.field,
      old_value: change.old_value,
      new_value: change.new_value,
      confidence: change.confidence,
      reason: change.reason,
      model,
      status,
      created_at: new Date().toISOString(),
      applied_at:
        status === "applied"
          ? new Date().toISOString()
          : null,
    });

  if (error) {
    console.error("SEO change log failed:", error.message);
  }
}

export async function runDailySeoOptimization() {
  const startedAt = new Date();
  const supabase = await createSupabaseServiceClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  }

  const [candidates, searchOpportunities] = await Promise.all([
    collectSeoCandidates(supabase),
    getSearchConsoleOpportunities(250).catch(() => []),
  ]);

  const opportunityScore = new Map<string, number>();
  for (const row of searchOpportunities as any[]) {
    try {
      const path = new URL(String(row?.page || "")).pathname;
      const impressions = Number(row?.impressions || 0);
      const position = Number(row?.position || 100);
      const ctr = Number(row?.ctr || 0);
      let boost = Math.min(20, Math.log10(impressions + 1) * 5);
      if (position >= 8 && position <= 25) boost += 8;
      if (impressions >= 20 && ctr < 0.02) boost += 6;
      opportunityScore.set(path, Math.max(opportunityScore.get(path) || 0, boost));
    } catch {}
  }

  const selected = candidates
    .map((candidate) => ({
      candidate,
      score: scoreSeoNeed(candidate) + (opportunityScore.get(candidate.url_path) || 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, SEO_MAX_ITEMS_PER_RUN)
    .map((item) => item.candidate);

  let analyzed = 0;
  let improvementsFound = 0;
  let applied = 0;
  let needsReview = 0;
  let failed = 0;

  const results: Array<Record<string, unknown>> = [];

  for (const candidate of selected) {
    try {
      const {
        model,
        change,
      } = await analyzeCandidateWithGemini(candidate);

      analyzed++;

      if (!change) {
        results.push({
          target: candidate.target_key,
          status: "no_change",
          model,
        });
        continue;
      }

      improvementsFound++;

      if (change.auto_apply) {
        const update = await applySeoChange(
          supabase,
          candidate,
          change
        );

        applied++;

        await logSeoChange(
          supabase,
          change,
          model,
          "applied"
        );

        results.push({
          target: candidate.target_key,
          status: "applied",
          confidence: change.confidence,
          update,
          model,
        });
      } else {
        needsReview++;

        await logSeoChange(
          supabase,
          change,
          model,
          "needs_review"
        );

        results.push({
          target: candidate.target_key,
          status: "needs_review",
          confidence: change.confidence,
          reason: change.reason,
          model,
        });
      }
    } catch (error) {
      failed++;

      results.push({
        target: candidate.target_key,
        status: "failed",
        error:
          error instanceof Error
            ? error.message
            : "Unknown SEO automation error.",
      });
    }
  }

  const finishedAt = new Date();

  await logSeoRun(supabase, {
    status: failed > 0 ? "partial" : "success",
    candidates_found: candidates.length,
    targets_analyzed: analyzed,
    improvements_found: improvementsFound,
    changes_applied: applied,
    needs_review: needsReview,
    failures: failed,
    metadata: {
      selected_targets: selected.length,
      selection_hash: contentHash(selected.map((item) => item.target_key)),
      search_console_opportunities: searchOpportunities.length,
    },
    started_at: startedAt.toISOString(),
    finished_at: finishedAt.toISOString(),
    created_at: finishedAt.toISOString(),
  });

  return {
    success: true,
    candidatesFound: candidates.length,
    analyzed,
    improvementsFound,
    applied,
    needsReview,
    failed,
    results,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
  };
}

export async function reviewSeoAutomationChange(
  changeId: string,
  decision: "approve" | "reject"
) {
  const { requireAdmin } = await import("@/lib/supabase/admin");
  const { revalidatePath } = await import("next/cache");
  await requireAdmin();
  const supabase = await createSupabaseServiceClient();
  if (!supabase) return { error: "SUPABASE_SERVICE_ROLE_KEY is missing." };

  const { data: change, error: loadError } = await supabase
    .from("seo_automation_change")
    .select("*")
    .eq("id", changeId)
    .maybeSingle();
  if (loadError || !change) return { error: loadError?.message || "SEO change not found." };
  if (change.status !== "needs_review") return { error: "This SEO change is no longer pending review." };

  if (decision === "reject") {
    const { error } = await supabase.from("seo_automation_change").update({ status: "rejected" }).eq("id", changeId);
    if (error) return { error: error.message };
    revalidatePath("/admin/seo");
    return { success: true };
  }

  if (!change.target_id) return { error: "SEO target ID is missing." };
  let parsed: Record<string, unknown> = {};
  try { parsed = JSON.parse(change.new_value || "{}"); } catch { return { error: "SEO suggestion payload is invalid." }; }
  const table = change.target_type === "casino" ? "casino" : change.target_type === "bonus" ? "bonus" : change.target_type === "guide" ? "guide" : "seo_settings";
  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.seo_title) updatePayload[change.target_type === "site" ? "title" : "seo_title"] = parsed.seo_title;
  if (parsed.seo_description) updatePayload[change.target_type === "site" ? "description" : "seo_description"] = parsed.seo_description;
  if (Object.keys(updatePayload).length <= 1) return { error: "SEO suggestion contains no applicable metadata." };

  const { error: updateError } = await supabase.from(table).update(updatePayload).eq("id", change.target_id);
  if (updateError) return { error: updateError.message };
  const { error: logError } = await supabase.from("seo_automation_change").update({ status: "applied", applied_at: new Date().toISOString() }).eq("id", changeId);
  if (logError) return { error: logError.message };
  revalidatePath("/admin/seo");
  revalidatePath("/");
  return { success: true };
}
