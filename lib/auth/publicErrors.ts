const TECHNICAL = /fetch failed|failed to fetch|networkerror|enotfound|econnrefused|etimedout|socket|undici|invalid api key|jwt|service role|admin_password|admin_email|cron_secret/i;

export function publicAuthMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (TECHNICAL.test(raw) || !raw.trim()) {
    return "We could not complete that sign-in request. Try again in a moment.";
  }
  if (/invalid login credentials|invalid_credentials|email not confirmed/i.test(raw)) {
    return raw.includes("confirm") ? "Check your email to confirm this account before signing in." : "That email and password combination is not recognised.";
  }
  if (raw.length > 180) return "We could not complete that request.";
  return raw;
}

export function logAuthFailure(scope: string, error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || "unknown");
  console.error(`[${scope}]`, TECHNICAL.test(raw) ? "upstream auth/network failure" : raw.slice(0, 180));
}
