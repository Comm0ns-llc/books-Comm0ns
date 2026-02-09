import { fail, ok } from "@/lib/response";
import { getSupabaseForRequest } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await getSupabaseForRequest();

  const { data, error } = await supabase
    .from("user_books")
    .select("id, status, condition, note, added_at, books!inner(*)")
    .eq("user_id", id)
    .neq("status", "private")
    .order("added_at", { ascending: false });

  if (error) return fail(error.message, 400);
  return ok(data ?? []);
}
