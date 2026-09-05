import NetworkFilters from "@/components/NetworkTable/NetworkFilters";
import NetworkTable from "@/components/NetworkTable/NetworkTable";
import styles from "@/components/Phase2/Phase2.module.css";
import { requirePortalAccess } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import { safeNetworkStatus, safePage } from "@/lib/phase2/presentation.mjs";
import { loadDirectReferrals } from "@/lib/phase2/queries";
import { getPhase2Dictionary } from "@/lib/phase2/translations";

export const metadata = { title: "Direct Referrals | Indo Investor" };

export default async function ReferralsPage({ searchParams }) {
  const { profile } = await requirePortalAccess("/network/referrals");
  const { locale } = await getServerDictionary(profile.language_code);
  const dictionary = getPhase2Dictionary(locale);
  const query = await searchParams;
  const page = safePage(query?.page);
  const search = typeof query?.search === "string" ? query.search.slice(0, 120) : "";
  const status = safeNetworkStatus(query?.status);
  const { rows, error } = await loadDirectReferrals({ page, search, status });
  const basePath = `/network/referrals?search=${encodeURIComponent(search)}&status=${status || ""}`;

  return <>
    <header className={styles.pageHeader}><span className={styles.eyebrow}>{dictionary.networkEyebrow}</span><h1>{dictionary.referralsTitle}</h1><p>{dictionary.referralsDescription}</p></header>
    <NetworkFilters dictionary={dictionary} values={{ search, status }} />
    {error ? <div className={styles.surface}><p className={styles.error}>{dictionary.network_error}</p></div>
      : <NetworkTable rows={rows} page={page} pageSize={20} basePath={basePath} dictionary={dictionary} locale={locale} />}
  </>;
}
