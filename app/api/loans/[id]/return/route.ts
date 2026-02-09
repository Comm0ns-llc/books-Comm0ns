import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_: Request, { params }: Params) {
  const { id } = await params;
  const { error, supabase } = await requireUser();
  if (error || !supabase) return error;

  const { data: loan, error: updateError } = await supabase
    .from("loans")
    .update({ status: "returned", returned_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, user_book_id, borrower_id")
    .single();

  if (updateError) return fail(updateError.message, 400);

  const [userBook] = await Promise.all([
    supabase.from("user_books").update({ status: "available" }).eq("id", loan.user_book_id),
    supabase.from("notifications").insert({
      user_id: loan.borrower_id,
      type: "loan_returned",
      reference_id: loan.id,
      message: "返却が完了しました。感想を投稿しましょう。"
    })
  ]);

  if (userBook.error) return fail(userBook.error.message, 400);
  return ok({ updated: true });
}
