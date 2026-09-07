const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
]);

export function parsePublicHttpUrl(value: string) {
  const raw = String(value || "").trim();
  if (!raw) return { ok: false as const, error: "URL is required." };
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false as const, error: "Enter a valid http or https URL." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false as const, error: "Only http and https URLs are allowed." };
  }
  if (parsed.username || parsed.password) {
    return { ok: false as const, error: "URLs with credentials are not allowed." };
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host || BLOCKED_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return { ok: false as const, error: "That host is not allowed." };
  }
  return { ok: true as const, url: parsed, host };
}

export function isPrivateIpv4(ip: string) {
  const parts = ip.split(".").map((n) => Number(n));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  return false;
}

export function isPrivateIp(ip: string) {
  const value = ip.trim().toLowerCase();
  if (!value) return true;
  if (value.includes(":")) {
    if (value === "::1" || value === "::" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80") || value.startsWith("::ffff:")) return true;
    const mapped = value.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIpv4(mapped[1]);
    return false;
  }
  return isPrivateIpv4(value);
}
