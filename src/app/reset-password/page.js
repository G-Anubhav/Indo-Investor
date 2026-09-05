import Link from "next/link";
import AuthForm from "@/components/Auth/AuthForm";
import AuthPage from "@/components/Auth/AuthPage";
import styles from "@/components/Auth/Auth.module.css";
import { getServerDictionary } from "@/lib/i18n/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = { title: "Choose New Password | Indo Investor" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const { locale, dictionary } = await getServerDictionary();
  let hasRecoverySession = false;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    hasRecoverySession = Boolean(user);
  } catch {
    hasRecoverySession = false;
  }

  return (
    <AuthPage dictionary={dictionary} locale={locale} returnTo="/reset-password">
      {hasRecoverySession ? (
        <AuthForm mode="reset" dictionary={dictionary} locale={locale} />
      ) : (
        <div className={styles.authCard}>
          <div className={styles.heading}>
            <span>{dictionary.auth.securePortal}</span>
            <h1>{dictionary.auth.expiredTitle}</h1>
            <p>{dictionary.auth.expiredSubtitle}</p>
          </div>
          <Link href="/forgot-password" className={`${styles.submitButton} ${styles.submitLink}`}>
            {dictionary.auth.sendRecovery}
          </Link>
        </div>
      )}
    </AuthPage>
  );
}
