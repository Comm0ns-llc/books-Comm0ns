import { ok } from "@/lib/response";
import { getServiceSupabase } from "@/lib/supabase";

const tables = [
  "users",
  "books",
  "user_books",
  "loans",
  "reviews",
  "messages",
  "notifications",
  "invitations"
] as const;

export async function GET() {
  const admin = getServiceSupabase();

  const results = await Promise.all(
    tables.map(async (table) => {
      const { error } = await admin.from(table).select("id").limit(1);
      return {
        table,
        ok: !error,
        error: error?.message ?? null
      };
    })
  );

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    return Response.json(
      {
        error: "DB check failed",
        checkedAt: new Date().toISOString(),
        failed
      },
      { status: 500 }
    );
  }

  return ok({
    status: "ok",
    checkedAt: new Date().toISOString(),
    tables: results
  });
}
