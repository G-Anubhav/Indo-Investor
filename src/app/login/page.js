import AuthForm from "@/components/Auth/AuthForm";
import AuthPage from "@/components/Auth/AuthPage";
import { getServerDictionary } from "@/lib/i18n/server";

const allowedNotices = new Set([
  "authentication_required",
  "session_expired",
  "profile_unavailable",
  "account_inactive",
  "configuration_error",
  "expired_link",
  "password_updated",
  "signed_out",
]);

export const metadata = { title: "Secure Login | Indo Investor" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const candidate = params?.error || params?.message || "";
  const noticeCode = allowedNotices.has(candidate) ? candidate : "";
  const { locale, dictionary } = await getServerDictionary();

  return (
    <AuthPage dictionary={dictionary} locale={locale} returnTo="/login">
      <AuthForm mode="login" dictionary={dictionary} locale={locale} noticeCode={noticeCode} />
    </AuthPage>
  );
}
