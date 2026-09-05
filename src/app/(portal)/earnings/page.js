import { requirePortalAccess } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import { loadEarnings } from "@/lib/phase3/queries";
import { getPhase3Dictionary } from "@/lib/phase3/translations";
import { money } from "@/lib/phase3/presentation.mjs";
import styles from "@/components/Financial/Financial.module.css";

export const metadata = { title: "Earnings | Indo Investor" };

function Empty({ text }) { return <p className={styles.empty}>{text}</p>; }

export default async function EarningsPage() {
  const { profile } = await requirePortalAccess("/earnings");
  const { locale } = await getServerDictionary(profile.language_code);
  const t = getPhase3Dictionary(locale);
  const data = await loadEarnings(profile.user_id);
  const totals = [
    data.direct.reduce((sum, row) => sum + Number(row.amount), 0),
    data.binary.reduce((sum, row) => sum + Number(row.commission_amount), 0),
    data.incentives.reduce((sum, row) => sum + Number(row.amount), 0),
  ];

  return <>
    <header className={styles.header}><span className={styles.eyebrow}>{t.financeEyebrow}</span><h1>{t.earningsTitle}</h1><p>{t.earningsDescription}</p></header>
    <section className={styles.metrics}>{[t.directCommissions, t.binaryCommissions, t.monthlyIncentives].map((label, index) => <article className={styles.metric} key={label}><span>{label}</span><strong>{money(totals[index])}</strong></article>)}</section>
    <section className={styles.surface}><h2>{t.directCommissions}</h2>{data.direct.length === 0 ? <Empty text={t.noData} /> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Date</th><th>Qualifying amount</th><th>Rate</th><th>Amount</th><th>Status</th></tr></thead><tbody>{data.direct.map((row) => <tr key={row.id}><td>{new Date(row.created_at).toLocaleDateString("en-IN")}</td><td>{money(row.qualifying_amount)}</td><td>{Number(row.rate) * 100}%</td><td>{money(row.amount)}</td><td><span className={styles.status} data-status={row.status}>{row.status}</span></td></tr>)}</tbody></table></div>}</section>
    <section className={styles.surface}><h2>{t.binaryCommissions}</h2>{data.binary.length === 0 ? <Empty text={t.noData} /> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Date</th><th>New left</th><th>New right</th><th>Matched</th><th>Carry forward</th><th>Amount</th></tr></thead><tbody>{data.binary.map((row) => <tr key={row.id}><td>{new Date(row.created_at).toLocaleDateString("en-IN")}</td><td>{money(row.new_left)}</td><td>{money(row.new_right)}</td><td>{money(row.matched_left)} / {money(row.matched_right)}</td><td>{money(row.closing_left)} / {money(row.closing_right)}</td><td>{money(row.commission_amount)}</td></tr>)}</tbody></table></div>}</section>
    <section className={styles.surface}><h2>{t.monthlyIncentives}</h2>{data.incentives.length === 0 ? <Empty text={t.noData} /> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Period</th><th>Qualifying volume</th><th>Consecutive months</th><th>Amount</th><th>Status</th></tr></thead><tbody>{data.incentives.map((row) => <tr key={row.id}><td>{new Date(row.period_start).toLocaleDateString("en-IN")}</td><td>{money(row.qualifying_volume)}</td><td>{row.consecutive_months}</td><td>{money(row.amount)}</td><td><span className={styles.status} data-status={row.status}>{row.status}</span></td></tr>)}</tbody></table></div>}</section>
  </>;
}
