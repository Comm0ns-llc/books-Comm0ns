import { requireUser } from "@/lib/auth";
import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { placeCreateSchema } from "@/lib/validators";

export async function GET() {
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const { data, error: queryError } = await supabase
    .from("place_members")
    .select("role, place:places(id, name, type, area, address, description, created_by, created_at)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  if (queryError) return fail(queryError.message, 400);
  return ok(data ?? []);
}

export async function POST(request: Request) {
  const { error, user, supabase } = await requireUser();
  if (error || !user || !supabase) return error;

  const parsed = await parseBody(request, placeCreateSchema);
  if (parsed.error) return parsed.error;
  if (!parsed.data) return fail("Invalid request body", 422);

  const { data: place, error: placeError } = await supabase
    .from("places")
    .insert({
      name: parsed.data.name,
      type: parsed.data.type,
      area: parsed.data.area ?? null,
      address: parsed.data.address ?? null,
      description: parsed.data.description ?? null,
      created_by: user.id
    })
    .select("*")
    .single();

  if (placeError || !place) return fail(placeError?.message ?? "Failed to create place", 400);

  const { error: memberError } = await supabase.from("place_members").insert({
    place_id: place.id,
    user_id: user.id,
    role: "admin"
  });

  if (memberError) return fail(memberError.message, 400);
  return ok(place, 201);
}
