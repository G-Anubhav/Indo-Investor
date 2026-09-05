import { requirePortalAccess } from "@/lib/auth/session";
import Link from "next/link";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { getServerDictionary } from "@/lib/i18n/server";
import styles from "@/components/PortalShell/PortalShell.module.css";

export const metadata = { title: "Administration | Indo Investor" };

export default async function AdminPage() {
  const { profile } = await requirePortalAccess("/admin");
  const { dictionary } = await getServerDictionary(profile.language_code);
  const t = dictionary.portal;

  return (
    <>
      <header className={styles.pageHeader}>
        <span>{t.administration}</span>
        <h1>{t.adminTitle}</h1>
        <p>{t.adminDescription}</p>
      </header>
      <section className={styles.infoPanel}>
        <div className={styles.identityGrid}>
          <div className={styles.identityItem}><span>{t.name}</span><strong>{profile.display_name}</strong></div>
          <div className={styles.identityItem}><span>{t.role}</span><strong>{profile.role_key}</strong></div>
        </div>
        <p className={styles.panelNote}>{t.dataNote}</p>
      </section>
      <section className={styles.quickPanel}>
        <nav className={styles.quickLinks} aria-label="Administrative tools">
          <Link href="/admin/financials"><FaFileInvoiceDollar />Financial operations</Link>
        </nav>
      </section>
    </>
  );
}
