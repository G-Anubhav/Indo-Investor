import styles from "@/components/Phase2/Phase2.module.css";

export default function InventoryLoading() {
  return <div className={styles.loading} aria-busy="true"><span /><span /><span /></div>;
}
