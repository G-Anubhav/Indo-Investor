const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MEMBER_CODE_PATTERN = /^IIIW[0-9]{4,}$/;

export function normalizeLoginIdentifier(value) {
  const identifier = typeof value === "string" ? value.trim() : "";
  return identifier.includes("@") ? identifier.toLowerCase() : identifier.toUpperCase();
}

export function isValidLoginIdentifier(value) {
  const identifier = normalizeLoginIdentifier(value);
  return identifier.length <= 254
    && (EMAIL_PATTERN.test(identifier) || MEMBER_CODE_PATTERN.test(identifier));
}

export async function resolveLoginEmail(identifier, findMemberEmail) {
  const normalized = normalizeLoginIdentifier(identifier);
  if (EMAIL_PATTERN.test(normalized)) return normalized;

  const memberEmail = await findMemberEmail(normalized);
  return memberEmail || `${normalized.toLowerCase()}@invalid.invalid`;
}
