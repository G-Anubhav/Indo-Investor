"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  forgotPasswordAction,
  loginAction,
  resetPasswordAction,
  signupAction,
} from "@/app/actions/auth";
import { lookupSponsorAction } from "@/app/actions/phase2";
import styles from "./Auth.module.css";

const actions = {
  login: loginAction,
  signup: signupAction,
  forgot: forgotPasswordAction,
  reset: resetPasswordAction,
};

function PasswordField({ name, label, error, dictionary, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label}</label>
      <div className={styles.passwordControl}>
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          title={visible ? dictionary.auth.hidePassword : dictionary.auth.showPassword}
          aria-label={visible ? dictionary.auth.hidePassword : dictionary.auth.showPassword}
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {error && <span id={`${name}-error`} className={styles.fieldError}>{dictionary.messages[error]}</span>}
    </div>
  );
}

export default function AuthForm({ mode, dictionary, locale, noticeCode, initialContext = {} }) {
  const positiveNotice = ["password_updated", "signed_out"].includes(noticeCode);
  const [sponsorCode, setSponsorCode] = useState(initialContext.sponsorCode || "");
  const [targetLeg, setTargetLeg] = useState(initialContext.targetLeg || "");
  const [sponsorResult, setSponsorResult] = useState(null);
  const [sponsorPending, startSponsorLookup] = useTransition();
  const [state, formAction, pending] = useActionState(actions[mode], {
    ok: positiveNotice,
    code: noticeCode || "",
    fields: {},
  });
  const fields = state?.fields || {};
  const title = dictionary.auth[`${mode}Title`];
  const subtitle = dictionary.auth[`${mode}Subtitle`];

  const validateSponsor = (code = sponsorCode) => {
    startSponsorLookup(async () => {
      setSponsorResult(await lookupSponsorAction(code));
    });
  };

  useEffect(() => {
    if (mode === "signup" && initialContext.sponsorCode) {
      validateSponsor(initialContext.sponsorCode);
    }
  }, []);

  return (
    <div className={styles.authCard} data-mode={mode}>
      <div className={styles.heading}>
        <span>{dictionary.auth.securePortal}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {state?.code && state.code !== "validation_failed" && (
        <div className={state.ok ? styles.successMessage : styles.errorMessage} role="status">
          {dictionary.messages[state.code] || dictionary.messages.network_error}
        </div>
      )}

      <form action={formAction} className={styles.authForm} noValidate>
        {mode === "signup" && (
          <>
            <div className={styles.field}>
              <label htmlFor="sponsorCode">{dictionary.auth.sponsorCode}</label>
              <div className={styles.inlineControl}>
                <input
                  id="sponsorCode"
                  name="sponsorCode"
                  value={sponsorCode}
                  onChange={(event) => {
                    setSponsorCode(event.target.value.toUpperCase());
                    setSponsorResult(null);
                  }}
                  required
                  aria-invalid={Boolean(fields.sponsorCode)}
                />
                <button type="button" onClick={() => validateSponsor()} disabled={sponsorPending}>
                  {sponsorPending ? dictionary.common.loading : dictionary.auth.validateSponsor}
                </button>
              </div>
              {sponsorResult?.ok && (
                <span className={styles.fieldSuccess}>
                  {dictionary.auth.sponsorConfirmed}: {sponsorResult.sponsor.display_name}
                </span>
              )}
              {sponsorResult && !sponsorResult.ok && (
                <span className={styles.fieldError}>{dictionary.messages[sponsorResult.code]}</span>
              )}
              {fields.sponsorCode && <span className={styles.fieldError}>{dictionary.messages[fields.sponsorCode]}</span>}
            </div>
            <div className={styles.field}>
              <label htmlFor="targetLeg">{dictionary.auth.targetLeg}</label>
              <select
                id="targetLeg"
                name="targetLeg"
                value={targetLeg}
                onChange={(event) => setTargetLeg(event.target.value)}
                required
                aria-invalid={Boolean(fields.targetLeg)}
              >
                <option value="">{dictionary.auth.chooseLeg}</option>
                <option value="left" disabled={sponsorResult?.ok && !sponsorResult.sponsor.left_available}>
                  {dictionary.auth.leftLeg}
                </option>
                <option value="right" disabled={sponsorResult?.ok && !sponsorResult.sponsor.right_available}>
                  {dictionary.auth.rightLeg}
                </option>
              </select>
              {fields.targetLeg && <span className={styles.fieldError}>{dictionary.messages[fields.targetLeg]}</span>}
            </div>
            <div className={styles.field}>
              <label htmlFor="fullName">{dictionary.auth.fullName}</label>
              <input id="fullName" name="fullName" autoComplete="name" required aria-invalid={Boolean(fields.fullName)} />
              {fields.fullName && <span className={styles.fieldError}>{dictionary.messages[fields.fullName]}</span>}
            </div>
          </>
        )}

        {(mode === "login" || mode === "signup" || mode === "forgot") && (
          <div className={styles.field}>
            <label htmlFor="email">{dictionary.auth.email}</label>
            <input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(fields.email)} />
            {fields.email && <span className={styles.fieldError}>{dictionary.messages[fields.email]}</span>}
          </div>
        )}

        {mode === "signup" && (
          <div className={styles.field}>
            <label htmlFor="mobilePhone">{dictionary.auth.mobilePhone}</label>
            <input id="mobilePhone" name="mobilePhone" type="tel" autoComplete="tel" placeholder="+919876543210" aria-invalid={Boolean(fields.mobilePhone)} />
            <small>{dictionary.auth.mobileHint}</small>
            {fields.mobilePhone && <span className={styles.fieldError}>{dictionary.messages[fields.mobilePhone]}</span>}
          </div>
        )}

        {(mode === "login" || mode === "signup" || mode === "reset") && (
          <PasswordField
            name="password"
            label={dictionary.auth.password}
            error={fields.password}
            dictionary={dictionary}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        )}

        {(mode === "signup" || mode === "reset") && (
          <>
            {mode === "signup" && <p className={styles.passwordHint}>{dictionary.auth.passwordHint}</p>}
            <PasswordField
              name="confirmPassword"
              label={dictionary.auth.confirmPassword}
              error={fields.confirmPassword}
              dictionary={dictionary}
              autoComplete="new-password"
            />
          </>
        )}

        {mode === "login" && (
          <div className={styles.formOptions}>
            <label className={styles.checkLabel}>
              <input type="checkbox" name="remember" />
              <span>{dictionary.auth.remember}</span>
            </label>
            <Link href="/forgot-password">{dictionary.auth.forgot}</Link>
          </div>
        )}

        {mode === "signup" && (
          <>
            <input type="hidden" name="languageCode" value={locale} />
            <label className={styles.checkLabel}>
              <input type="checkbox" name="acceptTerms" aria-invalid={Boolean(fields.acceptTerms)} />
              <span>{dictionary.auth.acceptTerms}</span>
            </label>
            {fields.acceptTerms && <span className={styles.fieldError}>{dictionary.messages[fields.acceptTerms]}</span>}
          </>
        )}

        <button type="submit" className={styles.submitButton} disabled={pending}>
          {pending ? dictionary.common.loading : dictionary.auth[mode === "forgot" ? "sendRecovery" : mode === "reset" ? "updatePassword" : mode]}
        </button>
      </form>

      <div className={styles.authFooter}>
        {mode === "login" && <p>{dictionary.auth.noAccount} <Link href="/signup">{dictionary.auth.createAccount}</Link></p>}
        {mode === "signup" && <p>{dictionary.auth.haveAccount} <Link href="/login">{dictionary.auth.login}</Link></p>}
        {(mode === "forgot" || mode === "reset") && <Link href="/login">{dictionary.auth.backLogin}</Link>}
      </div>
    </div>
  );
}
