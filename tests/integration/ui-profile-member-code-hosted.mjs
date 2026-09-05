import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const required = ["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY","SUPABASE_ENVIRONMENT","DEV_SEED_AFFILIATE_PASSWORD"];
assert.deepEqual(required.filter((key) => !process.env[key]), []);
assert.equal(process.env.SUPABASE_ENVIRONMENT, "development", "Hosted member-code test is development-only");

const options = { auth: { persistSession: false, autoRefreshToken: false } };
const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, options);
const createdIds = [];

async function main() {
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0,6)}`;
  const { data: existingNodes, error: nodeError } = await service.from("network_nodes").select("user_id,member_code,parent_user_id,placement_leg");
  assert.equal(nodeError, null);
  const occupied = new Set(existingNodes.filter((node) => node.parent_user_id).map((node) => `${node.parent_user_id}:${node.placement_leg}`));
  const slots = [];
  for (const node of existingNodes) {
    for (const leg of ["left","right"]) if (!occupied.has(`${node.user_id}:${leg}`)) slots.push({ sponsorCode: node.member_code, leg });
  }
  assert.ok(slots.length >= 2, "Two development network slots are required");
  const users = await Promise.all([1,2].map((index) => service.auth.admin.createUser({
    email: `member-code-${index}-${suffix}@example.test`,
    password: process.env.DEV_SEED_AFFILIATE_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: `Concurrent Member ${index}`, sponsor_code: slots[index - 1].sponsorCode, target_leg: slots[index - 1].leg },
  })));
  for (const result of users) {
    assert.equal(result.error, null);
    createdIds.push(result.data.user.id);
  }

  const { data: nodes, error } = await service.from("network_nodes").select("user_id,member_code").in("user_id", createdIds);
  assert.equal(error, null);
  assert.equal(nodes.length, 2);
  const codes = nodes.map(({ member_code }) => member_code).sort((a,b) => Number(a.slice(4)) - Number(b.slice(4)));
  assert.ok(codes.every((code) => /^IIIW[0-9]{4,}$/.test(code)));
  assert.equal(Number(codes[1].slice(4)) - Number(codes[0].slice(4)), 1, "Concurrent registrations receive adjacent unique codes");
  assert.equal(new Set(codes).size, 2);

  const member = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options);
  const login = await member.auth.signInWithPassword({ email: users[0].data.user.email, password: process.env.DEV_SEED_AFFILIATE_PASSWORD });
  assert.equal(login.error, null);
  const allowed = await member.from("profiles").update({ display_name: "Updated Concurrent Member", mobile_phone: `+91${String(Date.now()).slice(-10)}` }).eq("user_id", createdIds[0]);
  assert.equal(allowed.error, null);
  const elevation = await member.from("profiles").update({ role_key: "admin" }).eq("user_id", createdIds[0]);
  assert.ok(elevation.error);
  const memberCodeMutation = await member.from("network_nodes").update({ member_code: "IIIW999999" }).eq("user_id", createdIds[0]);
  assert.ok(memberCodeMutation.error);
  await member.auth.signOut({ scope: "local" });

  process.stdout.write(`Hosted profile and concurrent member-code verification passed (${codes.join(", ")}).\n`);
}

main().catch((error) => {
  process.stderr.write(`Hosted profile/member-code verification failed: ${error.message}\n`);
  process.exitCode = 1;
}).finally(async () => {
  if (createdIds.length) {
    const { data: wallets } = await service.from("wallets").select("id").in("user_id", createdIds);
    const walletIds = (wallets || []).map(({ id }) => id);
    if (walletIds.length) await service.from("financial_accounts").delete().in("wallet_id", walletIds);
    await service.from("wallets").delete().in("user_id", createdIds);
    await service.from("network_nodes").delete().in("user_id", createdIds);
    for (const id of createdIds) await service.auth.admin.deleteUser(id);
  }
});
