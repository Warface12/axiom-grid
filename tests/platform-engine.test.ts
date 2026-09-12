import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseComparisonParam, comparisonPath } from "../lib/compareSlug.ts";
import { isPlatformKind, catalogByHub, platformPath } from "../lib/catalog.ts";
import { parsePublicHttpUrl, isPrivateIp } from "../lib/httpUrl.ts";

describe("compare slugs", () => {
  it("parses vs pairs", () => {
    assert.deepEqual(parseComparisonParam("alpha-vs-beta"), ["alpha", "beta"]);
    assert.equal(comparisonPath(["alpha", "beta"]), "/compare/alpha-vs-beta");
  });
});

describe("catalog", () => {
  it("maps hubs and rejects unknown kinds", () => {
    assert.equal(isPlatformKind("exchange"), true);
    assert.equal(isPlatformKind("casino"), false);
    assert.equal(isPlatformKind("explorer"), true);
    assert.equal(isPlatformKind("tax"), true);
    assert.equal(isPlatformKind("bridge"), true);
    assert.equal(isPlatformKind("futures"), true);
    assert.equal(isPlatformKind("stablecoin"), true);
    assert.equal(isPlatformKind("lending"), true);
    assert.equal(isPlatformKind("restaking"), true);
    assert.equal(isPlatformKind("prediction"), true);
    assert.equal(isPlatformKind("rpc"), true);
    assert.equal(isPlatformKind("compliance"), true);
    assert.equal(catalogByHub("explorers")?.id, "explorer");
    assert.equal(platformPath("wallet", "ledger"), "/wallets/ledger");
  });
});

describe("url safety", () => {
  it("blocks private and credentialed URLs", () => {
    assert.equal(parsePublicHttpUrl("https://example.com").ok, true);
    assert.equal(parsePublicHttpUrl("http://localhost/x").ok, false);
    assert.equal(parsePublicHttpUrl("https://user:pass@example.com").ok, false);
    assert.equal(isPrivateIp("127.0.0.1"), true);
    assert.equal(isPrivateIp("8.8.8.8"), false);
  });
});

describe("json-ld extractor", () => {
  it("reads organization name and ignores junk", async () => {
    const { extractJsonLd } = await import("../lib/import/extractJsonLd.ts");
    const html = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Example Exchange","url":"https://example.com","description":"Public blurb"}</script>`;
    const out = extractJsonLd(html);
    assert.equal(out.name, "Example Exchange");
    assert.equal(out.url, "https://example.com");
  });
});
