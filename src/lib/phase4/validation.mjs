const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const signatures = {
  "application/pdf": { extension: "pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  "image/jpeg": { extension: "jpg", bytes: [0xff, 0xd8, 0xff] },
  "image/png": { extension: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
};

export const MAX_KYC_FILE_BYTES = 5 * 1024 * 1024;
export const KYC_DOCUMENT_TYPES = new Set(["pan", "aadhaar", "bank_proof"]);

export function validUuid(value) { return UUID.test(String(value || "")); }
export function cleanText(value, maximum = 500) { return String(value || "").trim().slice(0, maximum); }
export function normalizePan(value) { return cleanText(value, 20).replaceAll(/\s/g, "").toUpperCase(); }
export function validPan(value) { return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizePan(value)); }
export function normalizeDigits(value) { return cleanText(value, 30).replaceAll(/\D/g, ""); }
export function validAadhaarLast4(value) { return /^\d{4}$/.test(normalizeDigits(value)); }
export function validBankAccount(value) { return /^\d{9,18}$/.test(normalizeDigits(value)); }
export function normalizeIfsc(value) { return cleanText(value, 20).replaceAll(/\s/g, "").toUpperCase(); }
export function validIfsc(value) { return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(normalizeIfsc(value)); }

export function inspectKycFile({ name, type, size, bytes }) {
  const safeName = cleanText(name, 120);
  const signature = signatures[type];
  if (!safeName || /[\\/\x00-\x1f]/.test(safeName)) return { ok: false, code: "invalid_file_name" };
  if (!signature || size < 1 || size > MAX_KYC_FILE_BYTES) return { ok: false, code: "invalid_file_type_or_size" };
  if (!signature.bytes.every((value, index) => bytes[index] === value)) return { ok: false, code: "file_content_mismatch" };
  const suppliedExtension = safeName.split(".").pop()?.toLowerCase();
  const validExtensions = type === "image/jpeg" ? ["jpg", "jpeg"] : [signature.extension];
  if (!validExtensions.includes(suppliedExtension)) return { ok: false, code: "file_extension_mismatch" };
  return { ok: true, extension: signature.extension, safeName };
}

export function maskValue(value, visible = 4) {
  const text = String(value || "");
  return text ? `${"*".repeat(Math.max(4, text.length - visible))}${text.slice(-visible)}` : "Not provided";
}
