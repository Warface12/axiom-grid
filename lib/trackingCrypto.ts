import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

export function newClickId() {
  return randomBytes(16).toString("hex");
}

export function signPostback(secret: string, timestamp: string, eventId: string, body: string) {
  return createHmac("sha256", secret).update(`${timestamp}.${eventId}.${body}`).digest("hex");
}

export function verifyPostback(input: {
  secret: string;
  timestamp: string;
  eventId: string;
  body: string;
  signature: string;
  now?: number;
  maxSkewSeconds?: number;
}) {
  const now = input.now ?? Math.floor(Date.now() / 1000);
  const ts = Number(input.timestamp);
  const skew = input.maxSkewSeconds ?? 300;
  if (!Number.isFinite(ts) || Math.abs(now - ts) > skew) return { ok: false as const, error: "Timestamp outside allowed window." };
  const expected = signPostback(input.secret, input.timestamp, input.eventId, input.body);
  const a = Buffer.from(expected);
  const b = Buffer.from(String(input.signature || ""));
  if (a.length !== b.length) return { ok: false as const, error: "Invalid signature." };
  if (!timingSafeEqual(a, b)) return { ok: false as const, error: "Invalid signature." };
  return { ok: true as const };
}
