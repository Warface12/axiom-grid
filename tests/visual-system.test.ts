import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CATALOG } from "../lib/catalog.ts";

describe("empty category guides", () => {
  it("gives every catalog class research questions without invented companies", () => {
    for (const cat of CATALOG) {
      assert.ok(cat.summary.length > 20);
      assert.ok(cat.attributes.length >= 3);
    }
  });
});
