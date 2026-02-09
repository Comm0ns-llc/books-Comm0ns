import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/response";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_: Request, { params }: Params) {
  const { id } = await params;
  const { error, supabase } = await requireUser();
  if (error || !supabase) return error;

  const { data, error: updateError } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) return fail(updateError.message, 400);
  return ok(data);
}
