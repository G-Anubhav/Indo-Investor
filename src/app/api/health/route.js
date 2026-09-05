import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { productionConfigurationIssues } from "@/lib/production/config.mjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const configurationReady = productionConfigurationIssues().length === 0;
  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.rpc("production_health_snapshot");
    const databaseReady = !error && data?.database_ready === true;
    const environmentReady = process.env.NODE_ENV !== "production" || data?.environment === "production";
    const status = configurationReady && databaseReady && environmentReady ? "ok" : "degraded";
    return NextResponse.json({ status, checks: { application: configurationReady, database: databaseReady } }, {
      status: status === "ok" ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ status: "degraded", checks: { application: configurationReady, database: false } }, {
      status: 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}
