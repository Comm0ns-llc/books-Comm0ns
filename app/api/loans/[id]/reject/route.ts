import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_: Request, { params }: Params) {
  const { id } = await params;
  const { error, supabase } = await requireUser();
  if (error || !supabase) return error;

  const { data: loan, error: updateError } = await supabase
    .from("loans")
    .update({ status: "rejected" })
    .eq("id", id)
    .select("id, borrower_id")
    .single();

  if (updateError) return fail(updateError.message, 400);

  await supabase.from("notifications").insert({
    user_id: loan.borrower_id,
    type: "loan_request",
    reference_id: loan.id,
    message: "貸出リクエストは見送られました"
  });

  return ok({ updated: true });
}
