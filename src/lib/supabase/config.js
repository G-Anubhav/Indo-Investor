export class SupabaseConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "SupabaseConfigurationError";
  }
}

export function getSupabaseConfig() {
  // Next.js only exposes public variables to browser bundles when accessed literally.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const missing = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new SupabaseConfigurationError(
      `Missing required Supabase environment variables: ${missing.join(", ")}`,
    );
  }

  let url;
  try {
    url = new URL(supabaseUrl);
  } catch {
    throw new SupabaseConfigurationError(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL.",
    );
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new SupabaseConfigurationError(
      "NEXT_PUBLIC_SUPABASE_URL must use HTTP or HTTPS.",
    );
  }

  return {
    url: url.toString().replace(/\/$/, ""),
    anonKey: supabaseAnonKey,
  };
}

export function getSiteUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error("invalid protocol");
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new SupabaseConfigurationError(
      "NEXT_PUBLIC_SITE_URL must be a valid HTTP or HTTPS URL.",
    );
  }
}
