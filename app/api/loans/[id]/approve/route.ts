import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_: Request, { params }: Params) {
  const { id } = await params;
  const { error, supabase } = await requireUser();
  if (error || !supabase) return error;

  const { data: loan, error: updateError } = await supabase
    .from("loans")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, borrower_id")
    .single();

  if (updateError) return fail(updateError.message, 400);

  await supabase.from("notifications").insert({
    user_id: loan.borrower_id,
    type: "loan_approved",
    reference_id: loan.id,
    message: "貸出リクエストが承認されました"
  });

  return ok({ updated: true });
}
