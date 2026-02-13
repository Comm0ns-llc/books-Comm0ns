import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/response";

export async function GET(request: Request) {
  const { error, supabase } = await requireUser();
  if (error || !supabase) return error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  let query = supabase.from("users").select("id, display_name, status").limit(30);
  if (q) {
    query = query.ilike("display_name", `%${q}%`);
  }

  const { data, error: queryError } = await query.order("display_name", { ascending: true });
  if (queryError) return fail(queryError.message, 400);

  return ok(data ?? []);
}
