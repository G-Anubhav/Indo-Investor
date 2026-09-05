const REQUIRED_SEED_VARIABLES = [
  "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_PROJECT_REF", "SUPABASE_ENVIRONMENT", "SUPABASE_SEED_CONFIRMATION",
  "DEV_SEED_ADMIN_EMAIL", "DEV_SEED_ADMIN_PASSWORD", "DEV_SEED_AFFILIATE_EMAIL", "DEV_SEED_AFFILIATE_PASSWORD",
];

export function validateSeedEnvironment(environment = process.env) {
  if (environment.NODE_ENV === "production" || environment.APP_ENVIRONMENT === "production") throw new Error("Development seeding is disabled in production.");
  if (environment.ALLOW_DEV_SEED !== "true") throw new Error("Set ALLOW_DEV_SEED=true explicitly to run development seeding.");
  const missing = REQUIRED_SEED_VARIABLES.filter((name) => !environment[name]);
  if (missing.length) throw new Error(`Missing seed environment variables: ${missing.join(", ")}`);
  if (environment.SUPABASE_ENVIRONMENT !== "development") throw new Error("SUPABASE_ENVIRONMENT must be exactly 'development'.");

  const url = new URL(environment.NEXT_PUBLIC_SUPABASE_URL);
  const localHost = ["127.0.0.1", "localhost"].includes(url.hostname);
  if (!localHost && url.hostname !== `${environment.SUPABASE_PROJECT_REF}.supabase.co`) throw new Error("SUPABASE_PROJECT_REF does not match NEXT_PUBLIC_SUPABASE_URL.");
  if (environment.SUPABASE_SEED_CONFIRMATION !== `seed:${environment.SUPABASE_PROJECT_REF}`) throw new Error("SUPABASE_SEED_CONFIRMATION must exactly identify the target project.");
  for (const name of ["DEV_SEED_ADMIN_EMAIL", "DEV_SEED_AFFILIATE_EMAIL"]) {
    const email = environment[name].toLowerCase();
    if (!email.endsWith("@example.test") && !email.endsWith(".example.test")) throw new Error(`${name} must use the reserved example.test domain.`);
  }
  for (const name of ["DEV_SEED_ADMIN_PASSWORD", "DEV_SEED_AFFILIATE_PASSWORD"]) {
    const password = environment[name];
    if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) throw new Error(`${name} must be at least 12 characters and include uppercase, lowercase, and a number.`);
  }
  return true;
}
