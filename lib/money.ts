/** Decimal-safe commercial amounts as integer minor units (e.g. cents). Never settle with IEEE floats. */

export function parseMinorUnits(value: string | number, scale = 2) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return null;
  const [whole, frac = ""] = raw.split(".");
  const padded = (frac + "0".repeat(scale)).slice(0, scale);
  const sign = whole.startsWith("-") ? -1 : 1;
  const absWhole = whole.replace("-", "") || "0";
  const n = BigInt(absWhole) * BigInt(10 ** scale) + BigInt(padded || "0");
  return sign < 0 ? -n : n;
}

export function formatMinorUnits(units: bigint, scale = 2, currency = "USD") {
  const zero = BigInt(0);
  const sign = units < zero ? "-" : "";
  const abs = units < zero ? -units : units;
  const base = BigInt(10 ** scale);
  const whole = abs / base;
  const frac = (abs % base).toString().padStart(scale, "0");
  return `${sign}${whole.toString()}.${frac} ${currency}`;
}

export function addMinor(a: bigint, b: bigint) {
  return a + b;
}
