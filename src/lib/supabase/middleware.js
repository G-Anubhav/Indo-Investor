import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseConfig } from "./config";
import { REMEMBER_SESSION_COOKIE } from "./server";

const PERSISTENT_SESSION_SECONDS = 60 * 60 * 24 * 30;

export async function refreshSupabaseSession(request) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseConfig();
  const persistent =
    request.cookies.get(REMEMBER_SESSION_COOKIE)?.value === "true";

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOptions = { ...options };
          if (options.maxAge !== 0) {
            if (persistent) cookieOptions.maxAge = PERSISTENT_SESSION_SECONDS;
            else {
              delete cookieOptions.expires;
              delete cookieOptions.maxAge;
            }
          }
          response.cookies.set(name, value, cookieOptions);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return { response, user };
}
