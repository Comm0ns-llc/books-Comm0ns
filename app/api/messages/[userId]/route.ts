import { requireUser } from "@/lib/auth";
import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { messageSchema } from "@/lib/validators";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_: Request, { params }: Params) {
  const { userId } = await params;
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const { data, error: queryError } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true });

  if (queryError) return fail(queryError.message, 400);
  return ok(data ?? []);
}

export async function POST(request: Request, { params }: Params) {
  const { userId } = await params;
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const parsed = await parseBody(request, messageSchema);
  if (parsed.error) return parsed.error;
  if (!parsed.data) return fail("Invalid request body", 422);

  const { data, error: insertError } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: userId,
      body: parsed.data.body,
      loan_id: parsed.data.loanId ?? null
    })
    .select("*")
    .single();

  if (insertError) return fail(insertError.message, 400);
  return ok(data, 201);
}
