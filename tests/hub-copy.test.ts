import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CATALOG } from "../lib/catalog.ts";
import { hubFaqs, hubCompareNotes } from "../lib/hubCopy.ts";

describe("hub copy", () => {
  it("writes a real FAQ for every class", () => {
    for (const cat of CATALOG) {
      const faqs = hubFaqs(cat);
      assert.equal(faqs.length, 4);
      assert.ok(faqs[0].question.includes(cat.plural.toLowerCase()));
      assert.ok(hubCompareNotes(cat).length >= 4);
    }
  });
});
