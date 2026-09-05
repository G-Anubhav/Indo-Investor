const REQUIRED_PRODUCTION_VARIABLES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_PROJECT_REF",
  "SUPABASE_ENVIRONMENT",
  "APP_ENVIRONMENT",
  "ALLOW_DEV_SEED",
  "SMTP_USER",
  "SMTP_PASS",
  "CONTACT_RECIPIENT_EMAIL",
];

function parsedUrl(value) {
  try { return new URL(value); } catch { return null; }
}

export function productionConfigurationIssues(environment = process.env) {
  if (environment.NODE_ENV !== "production") return [];
  const issues = REQUIRED_PRODUCTION_VARIABLES.filter((name) => !environment[name]).map((name) => `missing:${name}`);
  if (environment.APP_ENVIRONMENT !== "production") issues.push("app_environment_not_production");
  if (environment.SUPABASE_ENVIRONMENT !== "production") issues.push("supabase_environment_not_production");
  if (environment.ALLOW_DEV_SEED !== "false") issues.push("development_seed_not_disabled");
  if (["DEV_SEED_ADMIN_EMAIL", "DEV_SEED_ADMIN_PASSWORD", "DEV_SEED_AFFILIATE_EMAIL", "DEV_SEED_AFFILIATE_PASSWORD"].some((name) => environment[name])) issues.push("development_credentials_present");

  const siteUrl = parsedUrl(environment.NEXT_PUBLIC_SITE_URL);
  if (!siteUrl || siteUrl.protocol !== "https:" || ["localhost", "127.0.0.1", "0.0.0.0"].includes(siteUrl.hostname)) issues.push("invalid_production_site_url");
  const supabaseUrl = parsedUrl(environment.NEXT_PUBLIC_SUPABASE_URL);
  if (!supabaseUrl || supabaseUrl.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(supabaseUrl.hostname)) issues.push("invalid_production_supabase_url");
  if (supabaseUrl && environment.SUPABASE_PROJECT_REF && supabaseUrl.hostname.endsWith(".supabase.co") && supabaseUrl.hostname !== `${environment.SUPABASE_PROJECT_REF}.supabase.co`) issues.push("supabase_project_reference_mismatch");
  if (environment.SUPABASE_SERVICE_ROLE_KEY && environment.SUPABASE_SERVICE_ROLE_KEY === environment.NEXT_PUBLIC_SUPABASE_ANON_KEY) issues.push("service_role_key_invalid");
  return [...new Set(issues)];
}

export function isProductionConfigurationSafe(environment = process.env) {
  return productionConfigurationIssues(environment).length === 0;
}
