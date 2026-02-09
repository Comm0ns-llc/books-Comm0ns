import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/response";

function generateCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function POST() {
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

  const { data, error: insertError } = await supabase
    .from("invitations")
    .insert({ inviter_id: user.id, code, expires_at: expiresAt })
    .select("*")
    .single();

  if (insertError) return fail(insertError.message, 400);
  return ok(data, 201);
}
