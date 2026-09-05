import NetworkTree from "@/components/NetworkTree/NetworkTree";
import pageStyles from "@/components/Phase2/Phase2.module.css";
import { requirePortalAccess } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import { loadCurrentNetworkNode, loadNetworkTree } from "@/lib/phase2/queries";
import { getPhase2Dictionary } from "@/lib/phase2/translations";

export const metadata = { title: "Network Tree | Indo Investor" };

export default async function NetworkPage({ searchParams }) {
  const { user, profile } = await requirePortalAccess("/network");
  const { locale } = await getServerDictionary(profile.language_code);
  const dictionary = getPhase2Dictionary(locale);
  const query = await searchParams;
  const requestedRoot = typeof query?.root === "string" ? query.root : user.id;
  const [{ node }, treeResult] = await Promise.all([
    loadCurrentNetworkNode(user.id),
    loadNetworkTree(requestedRoot, 3),
  ]);

  return (
    <>
      <header className={pageStyles.pageHeader}>
        <span className={pageStyles.eyebrow}>{dictionary.networkEyebrow}</span>
        <h1>{dictionary.networkTitle}</h1>
        <p>{dictionary.networkDescription}</p>
      </header>
      {treeResult.error || !node ? (
        <div className={pageStyles.surface}><p className={pageStyles.error}>{dictionary.treeError}</p></div>
      ) : (
        <NetworkTree
          rows={treeResult.rows}
          originalRootId={user.id}
          currentRootId={requestedRoot}
          dictionary={dictionary}
        />
      )}
    </>
  );
}
