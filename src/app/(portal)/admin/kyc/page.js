import Link from "next/link";
import { requirePortalAccess } from "@/lib/auth/session";
import { loadKycQueue } from "@/lib/phase4/queries";
import { formatKycStatus, getPhase4Dictionary } from "@/lib/phase4/translations";
import styles from "@/components/Kyc/Kyc.module.css";

export const metadata = { title: "KYC Review | Indo Investor" };
export default async function KycQueuePage({ searchParams }) {
  await requirePortalAccess("/admin/kyc");
  const query = await searchParams;
  const t = getPhase4Dictionary("en");
  const status = query?.status || "pending_review";
  const search = query?.search || "";
  const data = await loadKycQueue({ status, search, page: query?.page });
  return <><header className={styles.header}><div><span className={styles.eyebrow}>{t.eyebrow}</span><h1>{t.queueTitle}</h1><p>{t.queueDescription}</p></div><span className={styles.badge}>{data.count} records</span></header>
  <form className={styles.filters}><input name="search" defaultValue={search} placeholder="Search name or email"/><select name="status" defaultValue={status}><option value="pending_review">Pending review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="resubmission_required">Resubmission required</option><option value="draft">In progress</option><option value="all">All statuses</option></select><button className={styles.button}>Filter</button></form>
  <section className={styles.surface}>{data.rows.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>{t.applicant}</th><th>{t.version}</th><th>{t.status}</th><th>{t.submitted}</th><th>{t.actions}</th></tr></thead><tbody>{data.rows.map((row) => <tr key={row.id}><td><strong>{row.profiles?.display_name}</strong><br/><span className={styles.muted}>{row.profiles?.email}</span></td><td>v{row.version}</td><td><span className={styles.badge} data-status={row.status}>{formatKycStatus(row.status)}</span></td><td>{row.submitted_at ? new Date(row.submitted_at).toLocaleString("en-IN") : "Not submitted"}</td><td><Link href={`/admin/kyc/${row.id}`}>{t.review}</Link></td></tr>)}</tbody></table></div> : <p className={styles.muted}>{t.noData}</p>}</section></>;
}
