import { requireUser } from "@/lib/auth";
import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { reviewSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { error, supabase } = await requireUser();
  if (error || !supabase) return error;

  const parsed = await parseBody(request, reviewSchema.partial());
  if (parsed.error || !parsed.data) return parsed.error;

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.rating !== undefined) payload.rating = parsed.data.rating;
  if (parsed.data.body !== undefined) payload.body = parsed.data.body;
  if (parsed.data.readAt !== undefined) payload.read_at = parsed.data.readAt;
  if (parsed.data.visibility !== undefined) payload.visibility = parsed.data.visibility;

  const { data, error: updateError } = await supabase
    .from("reviews")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) return fail(updateError.message, 400);
  return ok(data);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const { error, supabase } = await requireUser();
  if (error || !supabase) return error;

  const { error: deleteError } = await supabase.from("reviews").delete().eq("id", id);
  if (deleteError) return fail(deleteError.message, 400);

  return ok({ deleted: true });
}
