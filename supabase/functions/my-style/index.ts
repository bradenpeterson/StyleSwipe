// supabase/functions/my-style/index.ts
// Step 5.5 — Return inspiration items user swiped 'like' on, most recent first
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { requireAuthorizedUser, requireBearerToken } from "../_shared/auth.ts";
import { handleCorsPreflight, handleFunctionError, jsonResponse } from "../_shared/http.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCorsPreflight(req);
  if (corsResponse) {
    return corsResponse;
  }

  if (req.method !== "GET") {
    return jsonResponse({ message: "Method not allowed" }, 405);
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");

    if (!userId) {
      return jsonResponse({ message: "Missing user_id query param" }, 400);
    }

    const jwt = requireBearerToken(req);
    const supabase = createAdminClient();
    await requireAuthorizedUser(supabase, jwt, userId);

    // Join swipes with inspiration_items, filter by user and direction='like', order by created_at desc
    const { data: rows, error } = await supabase
      .from("swipes")
      .select(`
        inspiration_items (
          id,
          image_url,
          tags,
          source
        )
      `)
      .eq("user_id", userId)
      .eq("direction", "like")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    // Extract items from join result (PostgREST may return nested row under table name or FK column); filter out nulls (deleted inspiration items)
    const items = (rows ?? [])
      .map((r: any) =>
        r.item_id ?? r.inspiration_items
      )
      .filter(Boolean) as Array<{ id: string; image_url: string; tags: string[]; source?: string }>;

    return jsonResponse({ items });
  } catch (error) {
    console.error("my-style error:", error);
    return handleFunctionError(error, "MY_STYLE_ERROR");
  }
});
