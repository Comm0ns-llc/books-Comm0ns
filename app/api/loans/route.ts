import { requireUser } from "@/lib/auth";
import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { loanRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const parsed = await parseBody(request, loanRequestSchema);
  if (parsed.error) return parsed.error;
  if (!parsed.data) return fail("Invalid request body", 422);

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .insert({
      user_book_id: parsed.data.userBookId,
      borrower_id: user.id,
      message: parsed.data.message ?? null,
      status: "requested"
    })
    .select("*")
    .single();

  if (loanError) return fail(loanError.message, 400);

  const { data: userBook } = await supabase
    .from("user_books")
    .select("user_id, book_id")
    .eq("id", parsed.data.userBookId)
    .single();

  if (userBook?.user_id) {
    await supabase.from("notifications").insert({
      user_id: userBook.user_id,
      type: "loan_request",
      reference_id: loan.id,
      message: "貸出リクエストが届きました"
    });
  }

  return ok(loan, 201);
}
