import { notFound } from "next/navigation";
import PlotGrid from "@/components/PlotGrid/PlotGrid";
import styles from "@/components/Phase2/Phase2.module.css";
import { requirePortalAccess } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import { loadProjectInventory } from "@/lib/phase2/queries";
import { getPhase2Dictionary } from "@/lib/phase2/translations";

export default async function ProjectInventoryPage({ params }) {
  const { user, profile } = await requirePortalAccess("/inventory");
  const { locale } = await getServerDictionary(profile.language_code);
  const dictionary = getPhase2Dictionary(locale);
  const { slug } = await params;
  const { project, plots, error } = await loadProjectInventory(slug);
  if (!project) notFound();

  return <>
    <header className={styles.pageHeader}><span className={styles.eyebrow}>{dictionary.inventoryEyebrow}</span><h1>{project.name} · {dictionary.plotGrid}</h1><p>{project.description}</p></header>
    {error ? <div className={styles.surface}><p className={styles.error}>{dictionary.network_error}</p></div>
      : plots.length === 0 ? <div className={styles.surface}><p className={styles.empty}>{dictionary.noProjects}</p></div>
        : <PlotGrid project={project} initialPlots={plots} currentUserId={user.id} dictionary={dictionary} locale={locale} />}
  </>;
}
