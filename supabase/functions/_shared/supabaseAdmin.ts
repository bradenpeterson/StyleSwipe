import { createClient } from "@supabase/supabase-js";
import { HttpError } from "./httpErrors.ts";

export function createAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new HttpError(500, "Supabase environment is not configured", "SERVER_CONFIG_ERROR");
  }
  return createClient(url, serviceRoleKey);
}
