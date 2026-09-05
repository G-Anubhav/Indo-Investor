import styles from "@/components/PortalShell/PortalShell.module.css";

export default function PortalLoading() {
  return <div className={styles.portalLoading} role="status" aria-label="Loading portal content">
    <span className={styles.loadingTitle} />
    <div className={styles.loadingCards}><span /><span /><span /></div>
    <span className={styles.loadingSurface} />
  </div>;
}
