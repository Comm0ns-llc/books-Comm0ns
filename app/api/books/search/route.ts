import { ok } from "@/lib/response";
import { getSupabaseForRequest } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) return ok([]);

  const supabase = await getSupabaseForRequest();
  const { data } = await supabase
    .from("books")
    .select("id, isbn, title, author, cover_url, genre")
    .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
    .limit(30);

  return ok(data ?? []);
}
