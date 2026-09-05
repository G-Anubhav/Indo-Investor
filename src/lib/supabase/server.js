import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

export const REMEMBER_SESSION_COOKIE = "iiw_remember_session";
const PERSISTENT_SESSION_SECONDS = 60 * 60 * 24 * 30;

function sessionCookieOptions(options, persistent) {
  if (options.maxAge === 0) return options;

  if (persistent) {
    return { ...options, maxAge: PERSISTENT_SESSION_SECONDS };
  }

  const { expires: _expires, maxAge: _maxAge, ...sessionOptions } = options;
  return sessionOptions;
}

export async function createServerSupabaseClient({ persistent } = {}) {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();
  const shouldPersist =
    persistent ?? cookieStore.get(REMEMBER_SESSION_COOKIE)?.value === "true";

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(
              name,
              value,
              sessionCookieOptions(options, shouldPersist),
            );
          });
        } catch {
          // Server Components cannot write cookies. Middleware refreshes them.
        }
      },
    },
  });
}
