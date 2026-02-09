import { fail } from "@/lib/response";
import { getSupabaseForRequest } from "@/lib/supabase";

export async function requireUser() {
  const supabase = await getSupabaseForRequest();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { error: fail("Unauthorized", 401), user: null, supabase: null };
  }

  return { error: null, user: data.user, supabase };
}
