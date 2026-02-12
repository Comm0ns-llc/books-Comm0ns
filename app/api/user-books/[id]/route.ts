import { requireUser } from "@/lib/auth";
import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(["available", "lent_out", "private", "reading"]).optional(),
  condition: z.enum(["new", "good", "fair", "poor"]).optional(),
  note: z.string().max(500).optional()
});

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { error, supabase } = await requireUser();
  if (error || !supabase) return error;

  const parsed = await parseBody(request, patchSchema);
  if (parsed.error) return parsed.error;
  if (!parsed.data) return fail("Invalid request body", 422);

  const { data, error: updateError } = await supabase
    .from("user_books")
    .update(parsed.data)
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

  const { error: deleteError } = await supabase.from("user_books").delete().eq("id", id);
  if (deleteError) return fail(deleteError.message, 400);

  return ok({ deleted: true });
}
