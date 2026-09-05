import Link from "next/link";
import { FaCalendarAlt, FaCheckCircle, FaFingerprint, FaIdCard, FaKey, FaLock, FaUser } from "react-icons/fa";
import { updateProfileAction } from "@/app/actions/profile";
import { requirePortalAccess } from "@/lib/auth/session";
import { isExecutiveRole } from "@/lib/auth/access.mjs";
import { formatKycStatus } from "@/lib/phase4/translations";
import styles from "@/components/Profile/Profile.module.css";

export const metadata = { title: "Profile | Indo Investor" };

export default async function ProfilePage({ searchParams }) {
  const params = await searchParams;
  const { supabase, profile } = await requirePortalAccess("/profile");
  const [{ data: node }, { data: kyc }] = await Promise.all([
    supabase.from("network_nodes").select("member_code, joined_at").eq("user_id", profile.user_id).single(),
    supabase.from("kyc_submissions").select("status, updated_at").eq("user_id", profile.user_id).order("version", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const initials = (profile.display_name || profile.full_name).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const message = params?.message === "profile_updated" ? "Profile details updated." : null;
  const error = params?.error === "duplicate_mobile"
    ? "That mobile number is already linked to another account."
    : params?.error ? "We could not update your profile. Review the fields and try again." : null;

  return <div className={styles.page}>
    <section className={styles.profileHero}>
      <div className={styles.avatar} aria-hidden="true">{initials}</div>
      <div className={styles.heroIdentity}>
        <span>Account profile</span>
        <h1>{profile.display_name}</h1>
        <p><FaFingerprint /> {node?.member_code || "Member code unavailable"}</p>
      </div>
      <div className={styles.heroBadges}>
        <span data-tone="success"><FaCheckCircle /> {profile.status}</span>
        <span><FaLock /> {profile.role_key}</span>
      </div>
    </section>

    {message && <p className={styles.feedback} role="status">{message}</p>}
    {error && <p className={styles.feedback} data-kind="error" role="alert">{error}</p>}

    <div className={styles.layout}>
      <form className={styles.surface} action={updateProfileAction}>
        <div className={styles.sectionHeading}><FaUser /><div><h2>Personal information</h2><p>Keep your contact details current.</p></div></div>
        <div className={styles.formGrid}>
          <label><span>Full name</span><input name="fullName" defaultValue={profile.full_name} minLength={2} maxLength={120} required /></label>
          <label><span>Display name</span><input name="displayName" defaultValue={profile.display_name} minLength={2} maxLength={80} required /></label>
          <label><span>Email address</span><input value={profile.email} readOnly aria-describedby="email-note" /><small id="email-note">Managed through your authenticated identity.</small></label>
          <label><span>Mobile number</span><input name="mobilePhone" defaultValue={profile.mobile_phone || ""} placeholder="+919876543210" inputMode="tel" /></label>
        </div>
        <button className={styles.primaryButton} type="submit">Save profile</button>
      </form>

      <aside className={styles.sideColumn}>
        <section className={styles.surface}>
          <div className={styles.sectionHeading}><FaIdCard /><div><h2>Account overview</h2><p>Protected account attributes.</p></div></div>
          <dl className={styles.detailList}>
            <div><dt>Member code</dt><dd>{node?.member_code || "Unavailable"}</dd></div>
            <div><dt>Role</dt><dd>{profile.role_key}</dd></div>
            <div><dt>Status</dt><dd>{profile.status}</dd></div>
            <div><dt><FaCalendarAlt /> Created</dt><dd>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(profile.created_at))}</dd></div>
          </dl>
        </section>
        <section className={styles.surface}>
          <div className={styles.sectionHeading}><FaKey /><div><h2>Security</h2><p>Password and account verification.</p></div></div>
          <nav className={styles.securityLinks} aria-label="Account security">
            <Link href="/forgot-password">Reset password</Link>
            {isExecutiveRole(profile.role_key) && <Link href="/mfa">Manage MFA verification</Link>}
          </nav>
        </section>
        <section className={styles.surface}>
          <div className={styles.sectionHeading}><FaIdCard /><div><h2>KYC status</h2><p>{formatKycStatus(kyc?.status)}</p></div></div>
          <Link className={styles.secondaryButton} href="/kyc">View KYC workspace</Link>
        </section>
      </aside>
    </div>
  </div>;
}
