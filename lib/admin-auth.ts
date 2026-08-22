import { cookies } from "next/headers";

const encoder = new TextEncoder();
const COOKIE_NAME = "toppick_admin";

function sessionSecret() {
  return (process.env.ADMIN_SESSION_SECRET || process.env.CRON_SECRET || "").trim();
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export async function createAdminSession(email: string, ttlSeconds = 60 * 60 * 12) {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${email.toLowerCase()}:${expires}`;
  const signature = await hmac(payload, secret);
  return `${encodeURIComponent(payload)}.${signature}`;
}

export async function verifyAdminSession(token?: string) {
  const secret = sessionSecret();
  if (!token || !secret) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const encodedPayload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const payload = decodeURIComponent(encodedPayload);
  const split = payload.lastIndexOf(":");
  if (split < 1) return false;
  const email = payload.slice(0, split).toLowerCase();
  const expires = Number(payload.slice(split + 1));
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!adminEmail || email !== adminEmail) return false;
  return signature === await hmac(payload, secret);
}

export async function hasAdminSession() {
  const store = await cookies();
  return verifyAdminSession(store.get(COOKIE_NAME)?.value);
}

export { COOKIE_NAME };
