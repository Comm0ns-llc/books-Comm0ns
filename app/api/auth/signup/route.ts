import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { getServiceSupabase } from "@/lib/supabase";
import { signUpSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const { data, error } = await parseBody(request, signUpSchema);
  if (error) return error;
  if (!data) return fail("Invalid request body", 422);

  const admin = getServiceSupabase();
  let inviterId: string | null = null;
  let invitationId: string | null = null;

  if (data.inviteCode) {
    const { data: invitation, error: invitationError } = await admin
      .from("invitations")
      .select("id, inviter_id, expires_at, used_by")
      .eq("code", data.inviteCode)
      .single();

    if (invitationError || !invitation || invitation.used_by) {
      return fail("Invalid invite code", 400);
    }

    if (new Date(invitation.expires_at).getTime() < Date.now()) {
      return fail("Invite code expired", 400);
    }

    inviterId = invitation.inviter_id;
    invitationId = invitation.id;
  }

  const { data: authUser, error: signUpError } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: { display_name: data.displayName }
  });

  if (signUpError || !authUser.user) {
    return fail(signUpError?.message ?? "Failed to create user", 400);
  }

  const userId = authUser.user.id;

  const { error: userInsertError } = await admin.from("users").insert({
    id: userId,
    display_name: data.displayName,
    invited_by: inviterId
  });

  if (userInsertError) {
    return fail("Signup succeeded but profile setup failed", 500);
  }

  if (invitationId) {
    const { error: inviteUpdateError } = await admin
      .from("invitations")
      .update({ used_by: userId })
      .eq("id", invitationId);

    if (inviteUpdateError) {
      return fail("Signup succeeded but invitation update failed", 500);
    }
  }

  return ok({ userId }, 201);
}
