import {
  isValidLoginIdentifier,
  normalizeLoginIdentifier,
} from "./login-identifier.mjs";

export const SUPPORTED_LANGUAGES = ["en", "ru", "hi"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+[1-9][0-9]{7,14}$/;
const SPONSOR_CODE_PATTERN = /^IIIW[0-9]{4,}$/;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeEmail(value) {
  return text(value).toLowerCase();
}

export function validatePassword(password) {
  const value = typeof password === "string" ? password : "";
  const errors = [];

  if (value.length < 8) errors.push("password_too_short");
  if (value.length > 128) errors.push("password_too_long");
  if (!/[a-z]/.test(value)) errors.push("password_lowercase_required");
  if (!/[A-Z]/.test(value)) errors.push("password_uppercase_required");
  if (!/[0-9]/.test(value)) errors.push("password_number_required");

  return errors;
}

export function validateLoginInput(input) {
  const identifier = normalizeLoginIdentifier(input.identifier ?? input.email);
  const password = typeof input.password === "string" ? input.password : "";
  const errors = {};

  if (!isValidLoginIdentifier(identifier)) {
    errors.identifier = "validation_failed";
  }
  if (!password) errors.password = "password_required";

  return { valid: Object.keys(errors).length === 0, errors, values: { identifier, password } };
}

export function validateSignupInput(input) {
  const email = normalizeEmail(input.email);
  const fullName = text(input.fullName);
  const mobilePhone = text(input.mobilePhone);
  const languageCode = SUPPORTED_LANGUAGES.includes(input.languageCode)
    ? input.languageCode
    : "en";
  const password = typeof input.password === "string" ? input.password : "";
  const confirmPassword =
    typeof input.confirmPassword === "string" ? input.confirmPassword : "";
  const errors = {};
  const sponsorCode = text(input.sponsorCode).toUpperCase();
  const targetLeg = input.targetLeg === "left" || input.targetLeg === "right"
    ? input.targetLeg
    : "";

  if (fullName.length < 2 || fullName.length > 120) {
    errors.fullName = "invalid_full_name";
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    errors.email = "invalid_email";
  }
  if (mobilePhone && !PHONE_PATTERN.test(mobilePhone)) {
    errors.mobilePhone = "invalid_mobile_phone";
  }
  if (!SPONSOR_CODE_PATTERN.test(sponsorCode)) {
    errors.sponsorCode = "invalid_sponsor_code";
  }
  if (!targetLeg) errors.targetLeg = "target_leg_required";

  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) errors.password = passwordErrors[0];
  if (password !== confirmPassword) errors.confirmPassword = "passwords_do_not_match";
  if (!input.acceptTerms) errors.acceptTerms = "terms_required";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      email,
      fullName,
      mobilePhone: mobilePhone || null,
      languageCode,
      password,
      sponsorCode,
      targetLeg,
    },
  };
}

export function validateRecoveryInput(input) {
  const email = normalizeEmail(input.email);
  const errors = {};
  if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.email = "invalid_email";
  return { valid: Object.keys(errors).length === 0, errors, values: { email } };
}

export function validateResetInput(input) {
  const password = typeof input.password === "string" ? input.password : "";
  const confirmPassword =
    typeof input.confirmPassword === "string" ? input.confirmPassword : "";
  const errors = {};
  const passwordErrors = validatePassword(password);

  if (passwordErrors.length > 0) errors.password = passwordErrors[0];
  if (password !== confirmPassword) errors.confirmPassword = "passwords_do_not_match";

  return { valid: Object.keys(errors).length === 0, errors, values: { password } };
}
