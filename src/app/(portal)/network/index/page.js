import NetworkFilters from "@/components/NetworkTable/NetworkFilters";
import NetworkTable from "@/components/NetworkTable/NetworkTable";
import styles from "@/components/Phase2/Phase2.module.css";
import { requirePortalAccess } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import { safeNetworkLeg, safeNetworkStatus, safePage } from "@/lib/phase2/presentation.mjs";
import { loadNetworkIndex } from "@/lib/phase2/queries";
import { getPhase2Dictionary } from "@/lib/phase2/translations";

export const metadata = { title: "Network Index | Indo Investor" };

export default async function NetworkIndexPage({ searchParams }) {
  const { profile } = await requirePortalAccess("/network/index");
  const { locale } = await getServerDictionary(profile.language_code);
  const dictionary = getPhase2Dictionary(locale);
  const query = await searchParams;
  const page = safePage(query?.page);
  const search = typeof query?.search === "string" ? query.search.slice(0, 120) : "";
  const status = safeNetworkStatus(query?.status);
  const leg = safeNetworkLeg(query?.leg);
  const { rows, error } = await loadNetworkIndex({ page, search, status, leg });
  const basePath = `/network/index?search=${encodeURIComponent(search)}&status=${status || ""}&leg=${leg || ""}`;

  return <>
    <header className={styles.pageHeader}><span className={styles.eyebrow}>{dictionary.networkEyebrow}</span><h1>{dictionary.networkIndexTitle}</h1><p>{dictionary.networkIndexDescription}</p></header>
    <NetworkFilters dictionary={dictionary} includeLeg values={{ search, status, leg }} />
    {error ? <div className={styles.surface}><p className={styles.error}>{dictionary.network_error}</p></div>
      : <NetworkTable rows={rows} page={page} pageSize={25} basePath={basePath} dictionary={dictionary} locale={locale} indexMode />}
  </>;
}
