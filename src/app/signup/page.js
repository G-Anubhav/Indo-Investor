import AuthForm from "@/components/Auth/AuthForm";
import AuthPage from "@/components/Auth/AuthPage";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Create Account | Indo Investor" };

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const { locale, dictionary } = await getServerDictionary();

  return (
    <AuthPage dictionary={dictionary} locale={locale} returnTo="/signup">
      <AuthForm
        mode="signup"
        dictionary={dictionary}
        locale={locale}
        initialContext={{
          sponsorCode: typeof params?.sponsor === "string" ? params.sponsor : "",
          targetLeg: params?.leg === "left" || params?.leg === "right" ? params.leg : "",
        }}
      />
    </AuthPage>
  );
}
