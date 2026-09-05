import test from "node:test";
import assert from "node:assert/strict";
import { inspectKycFile, maskValue, normalizeIfsc, normalizePan, validAadhaarLast4, validBankAccount, validIfsc, validPan } from "../src/lib/phase4/validation.mjs";

test("KYC identity fields are normalized and validated", () => {
  assert.equal(normalizePan(" abcde 1234f "), "ABCDE1234F");
  assert.equal(validPan("ABCDE1234F"), true);
  assert.equal(validPan("ABCDE12345"), false);
  assert.equal(validAadhaarLast4(" 1234 "), true);
  assert.equal(validAadhaarLast4("12345"), false);
  assert.equal(validBankAccount("001234567890"), true);
  assert.equal(validBankAccount("123"), false);
  assert.equal(normalizeIfsc(" hdfc 0001234 "), "HDFC0001234");
  assert.equal(validIfsc("HDFC0001234"), true);
});

test("document inspection requires matching MIME, extension, size, and magic bytes", () => {
  assert.deepEqual(inspectKycFile({ name: "pan.pdf", type: "application/pdf", size: 20, bytes: Buffer.from("%PDF-1.4 test") }), { ok: true, extension: "pdf", safeName: "pan.pdf" });
  assert.equal(inspectKycFile({ name: "pan.jpg", type: "image/jpeg", size: 4, bytes: Buffer.from([0xff, 0xd8, 0xff, 0x00]) }).ok, true);
  assert.equal(inspectKycFile({ name: "pan.pdf", type: "application/pdf", size: 20, bytes: Buffer.from("not pdf") }).code, "file_content_mismatch");
  assert.equal(inspectKycFile({ name: "pan.exe", type: "application/pdf", size: 20, bytes: Buffer.from("%PDF-1.4 test") }).code, "file_extension_mismatch");
});

test("masked values reveal only the requested suffix", () => {
  assert.equal(maskValue("123456789012", 4), "********9012");
  assert.equal(maskValue("", 4), "Not provided");
});
