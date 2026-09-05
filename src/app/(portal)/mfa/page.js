import { redirect } from "next/navigation";
import MfaSetup from "@/components/Auth/MfaSetup";
import { requirePortalAccess } from "@/lib/auth/session";
import { isExecutiveRole } from "@/lib/auth/access.mjs";

export const metadata = { title: "Security Verification | Indo Investor" };

export default async function MfaPage() {
  const { profile } = await requirePortalAccess("/mfa");
  if (!isExecutiveRole(profile.role_key)) redirect("/dashboard");
  return <MfaSetup />;
}
