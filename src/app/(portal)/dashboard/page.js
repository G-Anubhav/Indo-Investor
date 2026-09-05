import Link from "next/link";
import {
  FaBorderAll,
  FaCheckCircle,
  FaFingerprint,
  FaIdCard,
  FaShieldAlt,
  FaSitemap,
  FaUserFriends,
  FaUser,
  FaWallet,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { requirePortalAccess } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import { getPhase2Dictionary } from "@/lib/phase2/translations";
import styles from "@/components/PortalShell/PortalShell.module.css";

export const metadata = { title: "Dashboard | Indo Investor" };

export default async function DashboardPage() {
  const { profile, supabase } = await requirePortalAccess("/dashboard");
  const { data: networkIdentity } = await supabase.from("network_nodes").select("member_code").eq("user_id", profile.user_id).single();
  const { locale, dictionary } = await getServerDictionary(profile.language_code);
  const t = dictionary.portal;
  const phase2 = getPhase2Dictionary(locale);
  const firstName = profile.display_name.split(" ")[0];

  const details = [
    [t.name, profile.display_name],
    [t.email, profile.email],
    [t.mobile, profile.mobile_phone || t.notProvided],
    [t.language, locale],
    ["Member code", networkIdentity?.member_code || t.notProvided],
  ];

  const statusCards = [
    [<FaCheckCircle key="status" />, t.status, profile.status],
    [<FaShieldAlt key="role" />, t.role, profile.role_key],
    [<FaFingerprint key="session" />, t.session, t.sessionActive],
    [<FaIdCard key="member" />, "Member code", networkIdentity?.member_code || t.notProvided],
  ];

  return (
    <>
      <header className={styles.pageHeader}>
        <span>{t.dashboard}</span>
        <h1>{t.welcome}, {firstName}</h1>
        <p>{t.phaseDescription}</p>
      </header>

      <section className={styles.dashboardGrid} aria-label={t.accountOverview}>
        {statusCards.map(([icon, label, value]) => (
          <article className={styles.statusCard} key={label}>
            <div className={styles.statusIcon}>{icon}</div>
            <div><span>{label}</span><strong>{value}</strong></div>
          </article>
        ))}
      </section>

      <div className={styles.dashboardColumns}>
        <section className={styles.infoPanel}>
          <h2 className={styles.panelHeading}><FaIdCard />{t.identity}</h2>
          <div className={styles.identityGrid}>
            {details.map(([label, detail]) => (
              <div className={styles.identityItem} key={label}>
                <span>{label}</span>
                <strong>{detail}</strong>
              </div>
            ))}
          </div>
          <p className={styles.panelNote}>{t.dataNote}</p>
        </section>

        <section className={styles.quickPanel}>
          <h2 className={styles.panelHeading}>{t.quickAccess}</h2>
          <nav className={styles.quickLinks} aria-label={t.quickAccess}>
            <Link href="/network"><FaSitemap />{phase2.navigationNetwork}</Link>
            <Link href="/network/referrals"><FaUserFriends />{phase2.navigationReferrals}</Link>
            <Link href="/inventory"><FaBorderAll />{phase2.navigationInventory}</Link>
            <Link href="/wallets"><FaWallet />Wallets</Link>
            <Link href="/property-payments"><FaFileInvoiceDollar />Property payments</Link>
            <Link href="/profile"><FaUser />Profile</Link>
          </nav>
        </section>
      </div>
    </>
  );
}
