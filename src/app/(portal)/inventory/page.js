import Link from "next/link";
import { FaArrowRight, FaBuilding, FaLocationDot } from "react-icons/fa6";
import styles from "@/components/Phase2/Phase2.module.css";
import { requirePortalAccess } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import { loadActiveProjects } from "@/lib/phase2/queries";
import { getPhase2Dictionary } from "@/lib/phase2/translations";

export const metadata = { title: "Project Inventory | Indo Investor" };

export default async function InventoryPage() {
  const { profile } = await requirePortalAccess("/inventory");
  const { locale } = await getServerDictionary(profile.language_code);
  const dictionary = getPhase2Dictionary(locale);
  const { projects, error } = await loadActiveProjects();

  return <>
    <header className={styles.pageHeader}><span className={styles.eyebrow}>{dictionary.inventoryEyebrow}</span><h1>{dictionary.projectsTitle}</h1><p>{dictionary.projectsDescription}</p></header>
    {error ? <div className={styles.surface}><p className={styles.error}>{dictionary.network_error}</p></div>
      : projects.length === 0 ? <div className={styles.surface}><p className={styles.empty}>{dictionary.noProjects}</p></div>
        : <div className={styles.projectList}>{projects.map((project, index) => {
          const plots = project.plots || [];
          const available = plots.filter((plot) => plot.status === "available").length;
          return <article className={styles.projectCard} data-tone={index % 3} key={project.id}>
            <div className={styles.projectCardHeader}>
              <span className={styles.projectIcon}><FaBuilding aria-hidden="true" /></span>
              <small><FaLocationDot aria-hidden="true" />{project.location_name || dictionary.inventoryEyebrow}</small>
            </div>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <div className={styles.projectStats}>
              <span><strong>{plots.length}</strong>Total plots</span>
              <span><strong>{available}</strong>Available now</span>
            </div>
            <Link className={styles.primaryButton} href={`/inventory/${project.slug}`}>{dictionary.viewPlots}<FaArrowRight aria-hidden="true" /></Link>
          </article>;
        })}</div>}
  </>;
}
