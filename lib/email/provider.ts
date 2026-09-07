export type OutboundEmail = {
  to: string;
  subject: string;
  text: string;
  template?: string;
  category?: "transactional" | "marketing";
};

export type EmailSendResult = { ok: boolean; skipped: boolean; error?: string; provider: string };

export function emailProviderConfigured() {
  return Boolean((process.env.RESEND_API_KEY || process.env.SMTP_HOST || "").trim());
}

export async function sendEmail(message: OutboundEmail): Promise<EmailSendResult> {
  if (!emailProviderConfigured()) {
    return {
      ok: false,
      skipped: true,
      provider: "none",
      error: "OWNER ACTION REQUIRED: configure RESEND_API_KEY or SMTP before production email/outreach.",
    };
  }
  const key = (process.env.RESEND_API_KEY || "").trim();
  const from = (process.env.EMAIL_FROM || "").trim();
  if (!key || !from) {
    return { ok: false, skipped: true, provider: "resend", error: "OWNER ACTION REQUIRED: EMAIL_FROM is missing." };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to: message.to, subject: message.subject, text: message.text }),
    });
    if (!res.ok) return { ok: false, skipped: false, provider: "resend", error: `Provider status ${res.status}` };
    return { ok: true, skipped: false, provider: "resend" };
  } catch (error) {
    return { ok: false, skipped: false, provider: "resend", error: error instanceof Error ? error.message : "send failed" };
  }
}
