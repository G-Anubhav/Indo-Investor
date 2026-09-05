import Link from "next/link";
import AuthPage from "@/components/Auth/AuthPage";
import styles from "@/components/Auth/Auth.module.css";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Access Denied | Indo Investor" };

export default async function UnauthorizedPage() {
  const { locale, dictionary } = await getServerDictionary();
  return (
    <AuthPage dictionary={dictionary} locale={locale} returnTo="/unauthorized">
      <div className={styles.authCard}>
        <div className={styles.heading}>
          <span>{dictionary.auth.securePortal}</span>
          <h1>{dictionary.unauthorized.title}</h1>
          <p>{dictionary.unauthorized.description}</p>
        </div>
        <Link href="/dashboard" className={`${styles.submitButton} ${styles.submitLink}`}>
          {dictionary.unauthorized.dashboard}
        </Link>
      </div>
    </AuthPage>
  );
}
