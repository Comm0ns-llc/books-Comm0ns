import { requireUser } from "@/lib/auth";
import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { placeMemberCreateSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const { error, supabase } = await requireUser();
  if (error || !supabase) return error;

  const { data, error: queryError } = await supabase
    .from("place_members")
    .select("id, role, joined_at, users!inner(id, display_name, status)")
    .eq("place_id", id)
    .order("joined_at", { ascending: true });

  if (queryError) return fail(queryError.message, 400);
  return ok(data ?? []);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const { data: myMembership } = await supabase
    .from("place_members")
    .select("role")
    .eq("place_id", id)
    .eq("user_id", user.id)
    .single();

  if (!myMembership || myMembership.role !== "admin") {
    return fail("管理者のみメンバーを追加できます。", 403);
  }

  const parsed = await parseBody(request, placeMemberCreateSchema);
  if (parsed.error) return parsed.error;
  if (!parsed.data) return fail("Invalid request body", 422);

  const { data, error: insertError } = await supabase
    .from("place_members")
    .insert({
      place_id: id,
      user_id: parsed.data.userId,
      role: parsed.data.role
    })
    .select("*")
    .single();

  if (insertError) return fail(insertError.message, 400);
  return ok(data, 201);
}
