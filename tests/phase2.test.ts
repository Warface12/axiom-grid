import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isMemberOf, OFFER_TYPES, USER_INTERESTS } from "../lib/ecosystem.ts";

describe("interests", () => {
  it("keeps the optional consumer interest catalog", () => {
    assert.equal(isMemberOf(USER_INTERESTS, "research"), true);
    assert.equal(isMemberOf(USER_INTERESTS, "admin"), false);
  });
});

describe("offer engine constants", () => {
  it("keeps welcome offers without inventing cash guarantees", () => {
    assert.equal(isMemberOf(OFFER_TYPES, "welcome_offer"), true);
    assert.equal(isMemberOf(OFFER_TYPES, "cash_guaranteed"), false);
  });
});
