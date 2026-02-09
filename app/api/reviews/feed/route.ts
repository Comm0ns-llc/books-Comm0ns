import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/response";

export async function GET() {
  const { error, supabase } = await requireUser();
  if (error || !supabase) return error;

  const { data, error: queryError } = await supabase
    .from("reviews")
    .select("id, rating, body, created_at, books!inner(id, title), users!inner(id, display_name)")
    .in("visibility", ["public", "community"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (queryError) return fail(queryError.message, 400);
  return ok(data ?? []);
}
