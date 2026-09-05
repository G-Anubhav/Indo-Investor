import Link from "next/link";
import { notFound } from "next/navigation";
import { FaEye, FaFileArrowDown } from "react-icons/fa6";
import { openKycDocumentAction, reviewKycAction } from "@/app/actions/phase4";
import { requirePortalAccess } from "@/lib/auth/session";
import { loadKycReview } from "@/lib/phase4/queries";
import { formatKycStatus, getPhase4Dictionary } from "@/lib/phase4/translations";
import { maskValue } from "@/lib/phase4/validation.mjs";
import styles from "@/components/Kyc/Kyc.module.css";

export const metadata = { title: "KYC Review Detail | Indo Investor" };
export default async function KycReviewPage({ params, searchParams }) {
  await requirePortalAccess("/admin/kyc");
  const { id } = await params;
  const query = await searchParams;
  const t = getPhase4Dictionary("en");
  const data = await loadKycReview(id, query?.reveal === "1");
  if (!data.submission) notFound();
  const row = data.submission;
  return (
    <>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            <Link href="/admin/kyc">KYC queue</Link> / Review
          </span>
          <h1>{row.profiles?.display_name}</h1>
          <p>
            {row.profiles?.email} · Version {row.version}
          </p>
        </div>
        <span className={styles.badge} data-status={row.status}>
          {formatKycStatus(row.status)}
        </span>
      </header>
      {query?.result && (
        <p
          className={styles.message}
          data-kind={query.result === "reviewed" ? "success" : "error"}
        >
          {query.result === "reviewed" ? t.reviewed : t.failed}
        </p>
      )}
      <div className={styles.grid}>
        <div>
          <section className={styles.surface}>
            <h2>{t.details}</h2>
            {data.sensitive ? (
              <div className={styles.protected}>
                <div>
                  <span>{t.pan}</span>
                  <strong>{data.sensitive.pan}</strong>
                </div>
                <div>
                  <span>{t.aadhaar}</span>
                  <strong>{maskValue(data.sensitive.aadhaar_last4, 4)}</strong>
                </div>
                <div>
                  <span>{t.bankAccount}</span>
                  <strong>{data.sensitive.bank_account}</strong>
                </div>
                <div>
                  <span>{t.ifsc}</span>
                  <strong>{data.sensitive.ifsc}</strong>
                </div>
                <div>
                  <span>{t.accountHolder}</span>
                  <strong>{data.sensitive.account_holder}</strong>
                </div>
              </div>
            ) : (
              <>
                <p className={styles.muted}>
                  Protected values are masked until explicitly revealed. Reveals
                  are rate-limited and audited.
                </p>
                <Link
                  className={styles.secondary}
                  href={`/admin/kyc/${id}?reveal=1`}
                >
                  <FaEye /> {t.reveal}
                </Link>
              </>
            )}
          </section>
          <section className={styles.surface}>
            <h2>{t.documents}</h2>
            <ul className={styles.documentList}>
              {data.documents.map((document) => (
                <li className={styles.document} key={document.id}>
                  <div>
                    <strong>
                      {document.document_type.replaceAll("_", " ")}
                    </strong>
                    <span>
                      {document.original_filename} · {document.mime_type} ·{" "}
                      {document.scan_status.replaceAll("_", " ")}
                    </span>
                  </div>
                  {document.scan_status === "clean" && (
                    <form action={openKycDocumentAction}>
                      <input
                        type="hidden"
                        name="document_id"
                        value={document.id}
                      />
                      <button className={styles.secondary}>
                        <FaFileArrowDown /> {t.download}
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          </section>
          {row.status === "pending_review" && (
            <section className={styles.surface}>
              <h2>Record decision</h2>
              <form action={reviewKycAction} className={styles.form}>
                <input type="hidden" name="submission_id" value={row.id} />
                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label>{t.reason}</label>
                  <input
                    name="reason"
                    maxLength="500"
                    placeholder="Required for rejection or resubmission"
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label>{t.notes}</label>
                  <textarea name="notes" maxLength="1000" />
                </div>
                <div className={`${styles.reviewActions} ${styles.fieldWide}`}>
                  <button
                    className={styles.button}
                    name="decision"
                    value="approved"
                  >
                    {t.approve}
                  </button>
                  <button
                    className={styles.danger}
                    name="decision"
                    value="rejected"
                  >
                    {t.reject}
                  </button>
                  <button
                    className={styles.secondary}
                    name="decision"
                    value="resubmission_required"
                  >
                    {t.resubmit}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
        <aside>
          <section className={styles.surface}>
            <h2>{t.history}</h2>
            <ol className={styles.timeline}>
              {data.events.map((event) => (
                <li key={event.id}>
                  <strong>{event.event_type.replaceAll("_", " ")}</strong>
                  <span>{event.outcome}</span>
                  <time>
                    {new Date(event.created_at).toLocaleString("en-IN")}
                  </time>
                </li>
              ))}
            </ol>
          </section>
          {row.rejection_reason && (
            <section className={styles.surface}>
              <h2>Decision reason</h2>
              <p className={styles.muted}>{row.rejection_reason}</p>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
