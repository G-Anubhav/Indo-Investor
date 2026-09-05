import { FaFileShield, FaLock, FaPaperPlane, FaUpload } from "react-icons/fa6";
import {
  saveKycAction,
  startKycAction,
  submitKycAction,
  uploadKycDocumentAction,
} from "@/app/actions/phase4";
import { requirePortalAccess } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import { loadMyKyc } from "@/lib/phase4/queries";
import { formatKycStatus, getPhase4Dictionary } from "@/lib/phase4/translations";
import styles from "@/components/Kyc/Kyc.module.css";

export const metadata = { title: "KYC & Compliance | Indo Investor" };
const documentLabels = {
  pan: "PAN card",
  aadhaar: "Aadhaar card",
  bank_proof: "Bank proof",
};

export default async function KycPage({ searchParams }) {
  const { profile } = await requirePortalAccess("/kyc");
  const { locale } = await getServerDictionary(profile.language_code);
  const t = getPhase4Dictionary(locale);
  const data = await loadMyKyc(profile.user_id);
  const query = await searchParams;
  const result = query?.result;
  const success = ["ok", "saved", "uploaded", "submitted"].includes(result);
  const message =
    result === "saved"
      ? t.saved
      : result === "uploaded"
        ? t.uploaded
        : result === "submitted"
          ? t.submittedMessage
          : result
            ? success
              ? t.saved
              : t.failed
            : null;
  const editable = data.current?.status === "draft";
  const documentsClean =
    data.documents.length === 3 &&
    data.documents.every((document) => document.scan_status === "clean");
  return (
    <>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.description}</p>
        </div>
        {data.current && (
          <span className={styles.badge} data-status={data.current.status}>
            {formatKycStatus(data.current.status)} · v{data.current.version}
          </span>
        )}
      </header>
      {message && (
        <p className={styles.message} data-kind={success ? "success" : "error"}>
          {message}
        </p>
      )}
      {!data.current ||
      ["rejected", "resubmission_required"].includes(data.current.status) ? (
        <section className={styles.surface}>
          <h2>
            {data.current ? "Create a corrected submission" : t.noSubmission}
          </h2>
          {data.current?.rejection_reason && (
            <p className={styles.muted}>{data.current.rejection_reason}</p>
          )}
          <form action={startKycAction}>
            <button className={styles.button}>
              <FaFileShield /> Start KYC submission
            </button>
          </form>
        </section>
      ) : (
        <div className={styles.grid}>
          <div>
            <section className={styles.surface}>
              <h2>
                <FaLock /> {t.details}
              </h2>
              {editable ? (
                <form action={saveKycAction} className={styles.form}>
                  <input
                    type="hidden"
                    name="submission_id"
                    value={data.current.id}
                  />
                  <div className={styles.field}>
                    <label>{t.pan}</label>
                    <input
                      name="pan"
                      autoComplete="off"
                      placeholder="ABCDE1234F"
                      required
                      maxLength="10"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>{t.aadhaar}</label>
                    <input
                      name="aadhaar_last4"
                      inputMode="numeric"
                      autoComplete="off"
                      required
                      maxLength="4"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>{t.bankAccount}</label>
                    <input
                      name="bank_account"
                      inputMode="numeric"
                      autoComplete="off"
                      required
                      maxLength="18"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>{t.ifsc}</label>
                    <input
                      name="ifsc"
                      autoComplete="off"
                      required
                      maxLength="11"
                    />
                  </div>
                  <div className={`${styles.field} ${styles.fieldWide}`}>
                    <label>{t.accountHolder}</label>
                    <input
                      name="account_holder"
                      autoComplete="name"
                      required
                      maxLength="120"
                    />
                  </div>
                  <button className={styles.button}>
                    <FaLock /> {t.save}
                  </button>
                </form>
              ) : (
                <p className={styles.muted}>
                  Protected details are locked while this version is{" "}
                  {formatKycStatus(data.current.status).toLowerCase()}.
                </p>
              )}
            </section>
            <section className={styles.surface}>
              <h2>{t.documents}</h2>
              <ul className={styles.documentList}>
                {["pan", "aadhaar", "bank_proof"].map((type) => {
                  const document = data.documents.find(
                    (item) => item.document_type === type,
                  );
                  return (
                    <li className={styles.document} key={type}>
                      <div>
                        <strong>{documentLabels[type]}</strong>
                        <span>
                          {document
                            ? `${document.original_filename} · ${Math.ceil(document.size_bytes / 1024)} KB · ${document.scan_status.replaceAll("_", " ")}`
                            : "Not uploaded"}
                        </span>
                      </div>
                      {editable && (
                        <form
                          action={uploadKycDocumentAction}
                          className={styles.upload}
                        >
                          <input
                            type="hidden"
                            name="submission_id"
                            value={data.current.id}
                          />
                          <input
                            type="hidden"
                            name="document_type"
                            value={type}
                          />
                          <input
                            type="file"
                            name="document"
                            accept="application/pdf,image/jpeg,image/png"
                            required
                          />
                          <button className={styles.secondary}>
                            <FaUpload /> {t.upload}
                          </button>
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
              {editable && (
                <form action={submitKycAction} style={{ marginTop: 16 }}>
                  <input
                    type="hidden"
                    name="submission_id"
                    value={data.current.id}
                  />
                  <button className={styles.button} disabled={!documentsClean}>
                    <FaPaperPlane />{" "}
                    {documentsClean
                      ? t.submit
                      : "Awaiting document security scan"}
                  </button>
                </form>
              )}
            </section>
          </div>
          <aside>
            <section className={styles.surface}>
              <h2>{t.history}</h2>
              {data.events.length ? (
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
              ) : (
                <p className={styles.muted}>{t.noData}</p>
              )}
            </section>
            <section className={styles.surface}>
              <h2>Eligibility gate</h2>
              <span
                className={styles.badge}
                data-status={data.eligible ? "approved" : "pending_review"}
              >
                {data.eligible ? "KYC approved" : "Not eligible"}
              </span>
              <p className={styles.muted}>
                This is an eligibility check only. Withdrawals are not
                implemented in this phase.
              </p>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
