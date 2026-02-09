import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { getSupabaseForRequest } from "@/lib/supabase";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const { data, error } = await parseBody(request, loginSchema);
  if (error || !data) return error;

  const supabase = await getSupabaseForRequest();
  const { data: result, error: loginError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  });

  if (loginError) {
    return fail(loginError.message, 401);
  }

  return ok({ user: result.user });
}
