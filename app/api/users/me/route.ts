import { requireUser } from "@/lib/auth";
import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { z } from "zod";

const updateSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional(),
  location: z.string().max(100).optional()
});

export async function GET() {
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const { data, error: queryError } = await supabase.from("users").select("*").eq("id", user.id).single();
  if (queryError) return fail(queryError.message, 400);

  return ok(data);
}

export async function PATCH(request: Request) {
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const parsed = await parseBody(request, updateSchema);
  if (parsed.error) return parsed.error;
  if (!parsed.data) return fail("Invalid request body", 422);

  const payload: Record<string, unknown> = {};
  if (parsed.data.displayName !== undefined) payload.display_name = parsed.data.displayName;
  if (parsed.data.bio !== undefined) payload.bio = parsed.data.bio;
  if (parsed.data.avatarUrl !== undefined) payload.avatar_url = parsed.data.avatarUrl;
  if (parsed.data.location !== undefined) payload.location = parsed.data.location;

  const { data, error: updateError } = await supabase
    .from("users")
    .update(payload)
    .eq("id", user.id)
    .select("*")
    .single();

  if (updateError) return fail(updateError.message, 400);
  return ok(data);
}
