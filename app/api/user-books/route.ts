import { requireUser } from "@/lib/auth";
import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { userBookSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const parsed = await parseBody(request, userBookSchema);
  if (parsed.error) return parsed.error;
  if (!parsed.data) return fail("Invalid request body", 422);

  const { data, error: insertError } = await supabase
    .from("user_books")
    .insert({
      user_id: user.id,
      book_id: parsed.data.bookId,
      status: parsed.data.status,
      condition: parsed.data.condition,
      note: parsed.data.note ?? null
    })
    .select("*")
    .single();

  if (insertError) return fail(insertError.message, 400);
  return ok(data, 201);
}
