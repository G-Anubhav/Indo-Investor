import { cookies } from "next/headers";
import { defaultLocale, getDictionary, normalizeLocale } from "./translations";

export const LANGUAGE_COOKIE = "iiw_language";

export async function getLocale(profileLanguage) {
  if (profileLanguage) return normalizeLocale(profileLanguage);
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LANGUAGE_COOKIE)?.value || defaultLocale);
}

export async function getServerDictionary(profileLanguage) {
  const locale = await getLocale(profileLanguage);
  return { locale, dictionary: getDictionary(locale) };
}
