import { createClient } from "@supabase/supabase-js";
import { validatePassword } from "../src/lib/auth/validation.mjs";

const [emailInput, fullNameInput, memberCodeInput, confirmation] = process.argv.slice(2);
const email = String(emailInput || "").trim().toLowerCase();
const fullName = String(fullNameInput || "").trim();
const memberCode = String(memberCodeInput || "").trim().toUpperCase();

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Hosted Supabase administration configuration is unavailable.");
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || fullName.length < 2) {
  throw new Error("A valid email address and full name are required.");
}
if (!/^IIIW[0-9]{4,}$/.test(memberCode) || confirmation !== `PROVISION:${memberCode}`) {
  throw new Error("A valid member code and matching provisioning confirmation are required.");
}

const environmentPassword = process.env.PROVISION_INITIAL_PASSWORD;
delete process.env.PROVISION_INITIAL_PASSWORD;
const password = environmentPassword || (await new Promise((resolve, reject) => {
  let value = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    value += chunk;
    if (/[\r\n]/.test(value)) {
      process.stdin.pause();
      resolve(value.split(/\r?\n/, 1)[0]);
    }
  });
  process.stdin.on("end", () => resolve(value.replace(/[\r\n]+$/, "")));
  process.stdin.on("error", reject);
}));

if (validatePassword(password).length > 0) {
  throw new Error("The supplied initial password does not meet the portal password policy.");
}

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  options,
);

async function emailExists() {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error("Unable to verify existing Auth identities.");
    if (data.users.some((user) => user.email?.toLowerCase() === email)) return true;
    if (data.users.length < 100) return false;
  }
  throw new Error("Auth identity verification exceeded the supported page limit.");
}

if (await emailExists()) throw new Error("The requested email address is already registered.");

const { data: existingCode, error: codeLookupError } = await service
  .from("network_nodes")
  .select("user_id")
  .eq("member_code", memberCode)
  .maybeSingle();
if (codeLookupError) throw new Error("Unable to verify the requested member code.");
if (existingCode) throw new Error("The requested member code is already assigned.");

const requestedAt = new Date();
const expiresAt = new Date(requestedAt.getTime() + (10 * 60 * 1000));
const { error: requestError } = await service.from("network_root_creation_requests").upsert({
  email,
  requested_at: requestedAt.toISOString(),
  expires_at: expiresAt.toISOString(),
}, { onConflict: "email" });
if (requestError) throw new Error("Unable to authorize root-account provisioning.");

let createdUserId = null;
try {
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, language_code: "en" },
    app_metadata: { allow_network_root: true },
  });
  if (createError || !created.user) throw new Error("Supabase Auth account creation failed.");
  createdUserId = created.user.id;

  const { data: profile, error: profileError } = await service
    .from("profiles")
    .select("user_id")
    .eq("user_id", createdUserId)
    .single();
  if (profileError || !profile) throw new Error("Application profile initialization failed.");

  const { error: codeError } = await service
    .from("network_nodes")
    .update({ member_code: memberCode })
    .eq("user_id", createdUserId);
  if (codeError) throw new Error("Member-code assignment failed.");

  const { error: roleError } = await service.rpc("service_set_profile_access", {
    target_user_id: createdUserId,
    requested_role: "admin",
    requested_status: "active",
    change_reason: "Initial client super administrator provisioning",
    operator_reference: `provision-${memberCode.toLowerCase()}`,
  });
  if (roleError) throw new Error("Administrator role assignment failed.");

  const { error: auditError } = await service.from("security_audit_log").insert({
    actor_user_id: null,
    target_user_id: createdUserId,
    action: "identity.super_admin_provisioned",
    source: "service",
    details: { member_code: memberCode, role: "admin" },
  });
  if (auditError) throw new Error("Provisioning audit write failed.");

  const { error: metadataError } = await service.auth.admin.updateUserById(createdUserId, {
    app_metadata: {},
  });
  if (metadataError) throw new Error("Temporary provisioning metadata cleanup failed.");

  process.stdout.write(`${JSON.stringify({
    created: true,
    memberCode,
    role: "admin",
    status: "active",
    emailConfirmed: true,
    mfaEnrollmentRequired: true,
  })}\n`);
} catch (error) {
  if (!createdUserId) {
    await service.from("network_root_creation_requests").delete().eq("email", email);
  }
  throw error;
}
