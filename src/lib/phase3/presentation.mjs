export const PAYMENT_STATUSES = new Set(["pending_verification", "verified", "rejected", "reversed"]);
export const WALLET_KINDS = new Set(["main_cash", "property_installment"]);

export function money(value, locale = "en-IN") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat(locale, { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(Number.isFinite(amount) ? amount : 0);
}

export function boundedText(value, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max).trim() : "";
}

export function validUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function validMoney(value) {
  const normalized = typeof value === "string" ? value.trim() : String(value ?? "");
  if (!/^\d{1,16}(?:\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return amount > 0 && Number.isSafeInteger(Math.round(amount * 100)) ? normalized : null;
}
