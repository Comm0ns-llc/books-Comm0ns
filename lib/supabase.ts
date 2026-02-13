import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export async function getSupabaseForRequest() {
  const cookieStore = await cookies();
  const safeSetCookie = (name: string, value: string, options: Record<string, unknown>) => {
    try {
      cookieStore.set({ name, value, ...(options as object) });
    } catch {
      // In Server Components, cookies are read-only. Ignore write attempts.
    }
  };

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        safeSetCookie(name, value, options);
      },
      remove(name: string, options: Record<string, unknown>) {
        safeSetCookie(name, "", options);
      }
    }
  });
}

export function getServiceSupabase() {
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
