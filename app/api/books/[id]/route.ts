import { fail, ok } from "@/lib/response";
import { getSupabaseForRequest } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await getSupabaseForRequest();

  const [bookRes, ownersRes, reviewsRes] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).single(),
    supabase
      .from("user_books")
      .select("id, status, condition, note, users!inner(id, display_name, avatar_url)")
      .eq("book_id", id)
      .neq("status", "private"),
    supabase
      .from("reviews")
      .select("id, rating, body, read_at, visibility, users!inner(id, display_name)")
      .eq("book_id", id)
      .order("created_at", { ascending: false })
  ]);

  if (bookRes.error) return fail(bookRes.error.message, 404);

  return ok({
    ...bookRes.data,
    owners: ownersRes.data ?? [],
    reviews: reviewsRes.data ?? []
  });
}
