import { fail, ok } from "@/lib/response";
import { getSupabaseForRequest } from "@/lib/supabase";

export async function POST() {
  const supabase = await getSupabaseForRequest();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return fail(error.message, 400);
  }

  return ok({ loggedOut: true });
}
