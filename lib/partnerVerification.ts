const CONSUMER = new Set(["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "yahoo.com", "icloud.com", "me.com", "aol.com", "proton.me", "protonmail.com"]);

export function hostnameOfUrl(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function emailDomain(email: string) {
  const part = email.trim().toLowerCase().split("@")[1] || "";
  return part.replace(/^www\./, "");
}

export function isConsumerMailbox(email: string) {
  return CONSUMER.has(emailDomain(email));
}

export type VerificationSignal = {
  score: number;
  status: "strong" | "manual_review";
  reasons: string[];
};

export function scorePartnerApplication(input: { website: string; email: string; existingPlatform: boolean }) {
  const reasons: string[] = [];
  let score = 0;
  const host = hostnameOfUrl(input.website);
  const domain = emailDomain(input.email);
  if (!host || !domain) {
    return { score: 0, status: "manual_review" as const, reasons: ["Website or email could not be parsed."] };
  }
  if (isConsumerMailbox(input.email)) {
    reasons.push("Consumer mailbox (Gmail/Outlook/etc) is allowed for agencies but is not automatic verification.");
  } else if (domain === host || host.endsWith(`.${domain}`) || domain.endsWith(`.${host.split(".").slice(-2).join(".")}`)) {
    score += 40;
    reasons.push("Business email domain is consistent with the official website.");
  } else {
    reasons.push("Email domain does not match the website. Could be an agency or contractor — manual review.");
  }
  if (input.existingPlatform) {
    score += 20;
    reasons.push("A TopPick company record already exists. Prefer claim over duplicate creation.");
  }
  reasons.push("Email verification is required before any company control is granted.");
  const status = score >= 40 && !isConsumerMailbox(input.email) ? "strong" as const : "manual_review" as const;
  return { score, status, reasons };
}
