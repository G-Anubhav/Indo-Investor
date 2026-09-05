import PortalShell from "@/components/PortalShell/PortalShell";
import { requirePortalAccess } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import { getPhase2Dictionary } from "@/lib/phase2/translations";
import { getPhase3Dictionary } from "@/lib/phase3/translations";
import { getPhase4Dictionary } from "@/lib/phase4/translations";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({ children }) {
  const { profile, supabase } = await requirePortalAccess("/dashboard");
  const { data: networkIdentity } = await supabase.from("network_nodes").select("member_code").eq("user_id", profile.user_id).single();
  const { locale, dictionary } = await getServerDictionary(profile.language_code);
  const phase2Dictionary = getPhase2Dictionary(locale);
  const phase3Dictionary = getPhase3Dictionary(locale);
  const phase4Dictionary = getPhase4Dictionary(locale);

  return (
    <PortalShell profile={profile} memberCode={networkIdentity?.member_code || null} dictionary={dictionary} phase2Dictionary={phase2Dictionary} phase3Dictionary={phase3Dictionary} phase4Dictionary={phase4Dictionary}>
      {children}
    </PortalShell>
  );
}
