const encoder = new TextEncoder();

// Embedded server-side session signing secret for this private deployment.
// IMPORTANT: keep the GitHub repository private. If this code is ever exposed publicly,
// rotate this value and the administrator password immediately.
export const ADMIN_SESSION_SECRET = "g3ZcN2r-ILWKIa2xmWh9m6jogXGdntDyAJYN9ZAb_DU5a2KqLuFmmEH4OrNlIk_P";

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export async function createAdminSession(email: string, secret = ADMIN_SESSION_SECRET, ttlSeconds = 60 * 60 * 12) {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${email}:${expires}`;
  const signature = await hmac(payload, secret);
  return `${encodeURIComponent(payload)}.${signature}`;
}

export async function verifyAdminSession(token: string | undefined, secret = ADMIN_SESSION_SECRET) {
  if (!token || !secret) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const encodedPayload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const payload = decodeURIComponent(encodedPayload);
  const split = payload.lastIndexOf(":");
  if (split < 1) return false;
  const expires = Number(payload.slice(split + 1));
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(payload, secret);
  return signature === expected;
}
