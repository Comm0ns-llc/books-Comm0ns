import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/response";

export async function GET() {
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const { data, error: queryError } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (queryError) return fail(queryError.message, 400);
  return ok(data ?? []);
}
