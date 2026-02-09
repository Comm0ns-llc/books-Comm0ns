import { z } from "zod";
import { fail } from "@/lib/response";

export async function parseBody<T extends z.ZodTypeAny>(request: Request, schema: T) {
  try {
    const json = await request.json();
    const data = schema.parse(json);
    return { data, error: null as Response | null };
  } catch {
    return { data: null, error: fail("Invalid request body", 422) };
  }
}
