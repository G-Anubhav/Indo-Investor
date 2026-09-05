import Link from "next/link";
import styles from "@/components/Phase2/Phase2.module.css";

function formatDate(value, locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

export default function NetworkTable({ rows, page, pageSize, basePath, dictionary, locale, indexMode = false }) {
  const total = Number(rows[0]?.total_count || 0);
  const hasNext = page * pageSize < total;

  return (
    <div className={styles.surface}>
      {rows.length === 0 ? (
        <p className={styles.empty}>{dictionary.noResults}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th>{dictionary.member}</th>
              {indexMode && <th>{dictionary.depth}</th>}
              <th>{dictionary.side}</th>
              <th>{dictionary.onboardingDate}</th>
              <th>{dictionary.accountStatus}</th>
              <th>{dictionary.purchaseHistory}</th>
            </tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.user_id}>
                  <td><div className={styles.member}><strong>{row.display_name}</strong><span>{row.member_code}</span></div></td>
                  {indexMode && <td>{row.depth}</td>}
                  <td>{dictionary[row.network_side || row.placement_leg]}</td>
                  <td>{formatDate(row.joined_at, locale)}</td>
                  <td><span className={styles.status} data-status={row.member_status}>{dictionary[row.member_status]}</span></td>
                  <td>{Number(row.booked_plot_count) > 0
                    ? `${row.booked_plot_count} ${dictionary.bookedPlots}`
                    : dictionary.noPurchaseHistory}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.pagination}>
        {page > 1
          ? <Link className={styles.secondaryButton} href={`${basePath}&page=${page - 1}`}>{dictionary.previous}</Link>
          : <button className={styles.secondaryButton} disabled>{dictionary.previous}</button>}
        <span>{dictionary.page} {page}</span>
        {hasNext
          ? <Link className={styles.secondaryButton} href={`${basePath}&page=${page + 1}`}>{dictionary.next}</Link>
          : <button className={styles.secondaryButton} disabled>{dictionary.next}</button>}
      </div>
    </div>
  );
}
