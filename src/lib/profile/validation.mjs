const PHONE_PATTERN = /^\+[1-9][0-9]{7,14}$/;
const NAME_PATTERN = /^[\p{L}\p{M} .'-]+$/u;
const SUPPORTED_LOCALES = new Set(["en", "ru", "hi"]);

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function validateProfileUpdate(input) {
  const fullName = clean(input.fullName);
  const displayName = clean(input.displayName);
  const mobilePhone = clean(input.mobilePhone);
  const languageCode = SUPPORTED_LOCALES.has(input.languageCode) ? input.languageCode : "";
  const errors = {};

  if (fullName.length < 2 || fullName.length > 120 || !NAME_PATTERN.test(fullName)) errors.fullName = "invalid_full_name";
  if (displayName.length < 2 || displayName.length > 80 || !NAME_PATTERN.test(displayName)) errors.displayName = "invalid_display_name";
  if (mobilePhone && !PHONE_PATTERN.test(mobilePhone)) errors.mobilePhone = "invalid_mobile_phone";
  if (!languageCode) errors.languageCode = "invalid_language";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: { fullName, displayName, mobilePhone: mobilePhone || null, languageCode },
  };
}
