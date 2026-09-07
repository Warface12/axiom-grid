import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatMetric, resolveCampaignDestination, trackedMetric, assertSameTenant } from "../lib/ecosystem.ts";
import { formatMinorUnits, parseMinorUnits } from "../lib/money.ts";
import { isConsumerMailbox, scorePartnerApplication } from "../lib/partnerVerification.ts";
import { signPostback, verifyPostback } from "../lib/trackingCrypto.ts";

describe("metrics", () => {
  it("does not treat untracked as zero", () => {
    assert.equal(formatMetric(trackedMetric(false, 0)), "Not tracked");
    assert.equal(formatMetric(trackedMetric(true, 0)), "0");
  });
});

describe("campaign destinations", () => {
  it("prefers TopPick affiliate only when active and permitted", () => {
    const hit = resolveCampaignDestination({
      affiliateRelationship: "active",
      affiliateUrl: "https://aff.example/x",
      affiliatePermittedForCampaign: true,
      partnerDestination: "https://partner.example/promo",
      officialUrl: "https://official.example",
    });
    assert.equal(hit.kind, "toppick_affiliate");
    const adOnly = resolveCampaignDestination({
      affiliateRelationship: "none",
      affiliateUrl: "https://aff.example/x",
      partnerDestination: "https://partner.example/promo",
    });
    assert.equal(adOnly.kind, "partner_campaign");
  });
});

describe("money", () => {
  it("parses decimal amounts without float drift", () => {
    const a = parseMinorUnits("10.10");
    const b = parseMinorUnits("0.20");
    assert.equal(a, 1010n);
    assert.equal(formatMinorUnits((a || 0n) + (b || 0n)), "10.30 USD");
  });
});

describe("verification", () => {
  it("treats matching business email as stronger than gmail", () => {
    const strong = scorePartnerApplication({ website: "https://company.com", email: "bd@company.com", existingPlatform: true });
    const gmail = scorePartnerApplication({ website: "https://company.com", email: "bd@gmail.com", existingPlatform: false });
    assert.equal(strong.status, "strong");
    assert.equal(gmail.status, "manual_review");
    assert.equal(isConsumerMailbox("a@gmail.com"), true);
  });
});

describe("postback", () => {
  it("rejects replay outside skew and accepts a valid signature", () => {
    const secret = "pepper:endpoint";
    const timestamp = "1000";
    const eventId = "evt-1";
    const body = "{\"event_type\":\"registration\"}";
    const signature = signPostback(secret, timestamp, eventId, body);
    assert.equal(verifyPostback({ secret, timestamp, eventId, body, signature, now: 1000 }).ok, true);
    assert.equal(verifyPostback({ secret, timestamp, eventId, body, signature, now: 10000, maxSkewSeconds: 60 }).ok, false);
  });
});

describe("tenant isolation helper", () => {
  it("throws across companies", () => {
    assert.throws(() => assertSameTenant("a", "b"));
    assert.doesNotThrow(() => assertSameTenant("a", "a"));
  });
});
