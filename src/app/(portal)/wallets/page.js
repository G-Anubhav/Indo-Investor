import { requirePortalAccess } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import { loadWallets } from "@/lib/phase3/queries";
import { getPhase3Dictionary } from "@/lib/phase3/translations";
import { money } from "@/lib/phase3/presentation.mjs";
import styles from "@/components/Financial/Financial.module.css";

export const metadata = { title: "Wallets | Indo Investor" };
export default async function WalletsPage() {
 const { profile }=await requirePortalAccess("/wallets"); const { locale }=await getServerDictionary(profile.language_code); const t=getPhase3Dictionary(locale); const data=await loadWallets(profile.user_id);
 return <><header className={styles.header}><span className={styles.eyebrow}>{t.financeEyebrow}</span><h1>{t.walletsTitle}</h1><p>{t.walletsDescription}</p></header>
 <section className={styles.metrics}>{data.wallets.map((wallet)=><article className={styles.metric} key={wallet.id}><span>{wallet.kind==="main_cash"?t.mainCash:t.propertyWallet}</span><strong>{money(wallet.balance)}</strong></article>)}</section>
 <section className={styles.surface}><h2>{t.transactionHistory}</h2>{data.error?<p className={styles.error}>{t.actionFailed}</p>:data.transactions.length===0?<p className={styles.empty}>{t.noData}</p>:<div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Date</th><th>Transaction</th><th>Debit</th><th>Credit</th></tr></thead><tbody>{data.transactions.map((row)=><tr key={row.id}><td>{new Date(row.created_at).toLocaleDateString("en-IN")}</td><td>{row.financial_journals.description}</td><td>{row.debit?money(row.debit):"-"}</td><td>{row.credit?money(row.credit):"-"}</td></tr>)}</tbody></table></div>}</section></>;
}
