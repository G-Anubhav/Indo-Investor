import AuthForm from "@/components/Auth/AuthForm";
import AuthPage from "@/components/Auth/AuthPage";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Password Recovery | Indo Investor" };

export default async function ForgotPasswordPage() {
  const { locale, dictionary } = await getServerDictionary();
  return (
    <AuthPage dictionary={dictionary} locale={locale} returnTo="/forgot-password">
      <AuthForm mode="forgot" dictionary={dictionary} locale={locale} />
    </AuthPage>
  );
}
