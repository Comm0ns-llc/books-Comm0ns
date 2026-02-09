import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_: Request, { params }: Params) {
  const { id } = await params;
  const { error, supabase } = await requireUser();
  if (error || !supabase) return error;

  const { data: loan, error: updateError } = await supabase
    .from("loans")
    .update({ status: "active", lent_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, user_book_id")
    .single();

  if (updateError) return fail(updateError.message, 400);

  await supabase.from("user_books").update({ status: "lent_out" }).eq("id", loan.user_book_id);
  return ok({ updated: true });
}
