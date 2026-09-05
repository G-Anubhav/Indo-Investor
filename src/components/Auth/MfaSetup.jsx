"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import styles from "./Auth.module.css";

export default function MfaSetup() {
  const router = useRouter();
  const [factor, setFactor] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    createBrowserSupabaseClient()
      .auth.mfa.listFactors()
      .then(({ data }) => {
        if (active)
          setFactor(
            data?.totp?.find((item) => item.status === "verified") || null,
          );
      });
    return () => {
      active = false;
    };
  }, []);

  async function enroll() {
    setBusy(true);
    setMessage("");
    const { data, error } = await createBrowserSupabaseClient().auth.mfa.enroll(
      { factorType: "totp", friendlyName: "Indo Investor privileged access" },
    );
    if (error) setMessage("Security verification could not be started.");
    else {
      setFactor({ id: data.id, status: "unverified" });
      setEnrollment(data.totp);
    }
    setBusy(false);
  }

  async function verify(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createBrowserSupabaseClient();
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: factor.id });
    if (challengeError) {
      setMessage("The verification challenge could not be created.");
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.id,
      code: code.trim(),
    });
    if (error) {
      setMessage("The verification code is invalid or expired.");
      setBusy(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className={styles.mfaSurface}>
      <section className={styles.mfaCard}>
        <div className={styles.heading}>
          <span>Privileged account security</span>
          <h1>Security verification</h1>
          <p>
            Use an authenticator application to establish an AAL2 session for
            executive and administrator access.
          </p>
        </div>
        {!factor && (
          <button
            type="button"
            className={styles.submitButton}
            disabled={busy}
            onClick={enroll}
          >
            Set up authenticator
          </button>
        )}
        {factor && (
          <form onSubmit={verify} className={styles.authForm}>
            {enrollment && (
              <div className={styles.field}>
                <label>Authenticator QR code</label>
                <Image
                  src={enrollment.qr_code}
                  alt="Authenticator enrollment QR code"
                  width={220}
                  height={220}
                  unoptimized
                />
                <small>
                  Store the recovery secret securely: {enrollment.secret}
                </small>
              </div>
            )}
            <div className={styles.field}>
              <label htmlFor="mfa-code">Six-digit code</label>
              <input
                id="mfa-code"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                required
              />
            </div>
            <button
              className={styles.submitButton}
              disabled={busy || code.length !== 6}
            >
              Verify
            </button>
          </form>
        )}
        {message && (
          <p className={styles.errorMessage} role="alert">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
