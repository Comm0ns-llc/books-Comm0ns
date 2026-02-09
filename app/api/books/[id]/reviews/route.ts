import { requireUser } from "@/lib/auth";
import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { reviewSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const { error, supabase } = await requireUser();
  if (error || !supabase) return error;

  const { data, error: queryError } = await supabase
    .from("reviews")
    .select("id, rating, body, read_at, visibility, created_at, users!inner(id, display_name)")
    .eq("book_id", id)
    .order("created_at", { ascending: false });

  if (queryError) return fail(queryError.message, 400);
  return ok(data ?? []);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const parsed = await parseBody(request, reviewSchema);
  if (parsed.error || !parsed.data) return parsed.error;

  const { data, error: insertError } = await supabase
    .from("reviews")
    .insert({
      book_id: id,
      user_id: user.id,
      rating: parsed.data.rating,
      body: parsed.data.body ?? null,
      read_at: parsed.data.readAt ?? null,
      visibility: parsed.data.visibility
    })
    .select("*")
    .single();

  if (insertError) return fail(insertError.message, 400);
  return ok(data, 201);
}
