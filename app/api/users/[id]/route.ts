import { fail, ok } from "@/lib/response";
import { getSupabaseForRequest } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await getSupabaseForRequest();

  const { data, error } = await supabase
    .from("users")
    .select("id, display_name, avatar_url, bio, location, created_at")
    .eq("id", id)
    .single();

  if (error) return fail(error.message, 404);
  return ok(data);
}
