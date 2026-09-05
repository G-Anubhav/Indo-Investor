import test from "node:test";
import assert from "node:assert/strict";
import { boundedText, money, validMoney, validUuid } from "../src/lib/phase3/presentation.mjs";

test("financial amounts accept positive decimal values with at most two decimals", () => {
  assert.equal(validMoney("25000"), "25000");
  assert.equal(validMoney("25000.50"), "25000.50");
  assert.equal(validMoney("0"), null);
  assert.equal(validMoney("-1"), null);
  assert.equal(validMoney("10.999"), null);
  assert.equal(validMoney("1e6"), null);
});

test("financial identifiers and bounded operator notes are normalized", () => {
  assert.equal(validUuid("20000000-0000-4000-8000-000000000001"), true);
  assert.equal(validUuid("not-an-id"), false);
  assert.equal(boundedText("  verified by bank  ", 12), "verified by");
});

test("money presentation uses INR without floating point calculations", () => {
  const rendered = money("25000.50");
  assert.match(rendered, /25,000\.50/);
  assert.match(rendered, /₹/);
});
