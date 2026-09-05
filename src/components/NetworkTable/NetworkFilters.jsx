import Link from "next/link";
import styles from "@/components/Phase2/Phase2.module.css";

export default function NetworkFilters({ dictionary, includeLeg = false, values = {} }) {
  return (
    <form className={styles.toolbar} method="get">
      <div className={styles.field}>
        <label htmlFor="network-search">{dictionary.search}</label>
        <input id="network-search" name="search" type="search" maxLength={120} defaultValue={values.search || ""} />
      </div>
      <div className={styles.field}>
        <label htmlFor="network-status">{dictionary.accountStatus}</label>
        <select id="network-status" name="status" defaultValue={values.status || ""}>
          <option value="">{dictionary.allStatuses}</option>
          <option value="active">{dictionary.active}</option>
          <option value="hold">{dictionary.hold}</option>
          <option value="pending_kyc">{dictionary.pending_kyc}</option>
        </select>
      </div>
      {includeLeg && (
        <div className={styles.field}>
          <label htmlFor="network-leg">{dictionary.side}</label>
          <select id="network-leg" name="leg" defaultValue={values.leg || ""}>
            <option value="">{dictionary.allSides}</option>
            <option value="left">{dictionary.left}</option>
            <option value="right">{dictionary.right}</option>
          </select>
        </div>
      )}
      <button className={styles.primaryButton} type="submit">{dictionary.applyFilters}</button>
      <Link className={styles.secondaryButton} href={includeLeg ? "/network/index" : "/network/referrals"}>{dictionary.clearFilters}</Link>
    </form>
  );
}
