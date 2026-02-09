import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/response";

export async function GET() {
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const { data, error: queryError } = await supabase
    .from("loans")
    .select("*, user_books!inner(book_id, user_id)")
    .or(`borrower_id.eq.${user.id},user_books.user_id.eq.${user.id}`)
    .order("requested_at", { ascending: false });

  if (queryError) return fail(queryError.message, 400);
  return ok(data ?? []);
}
