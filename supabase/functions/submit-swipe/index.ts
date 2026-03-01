// supabase/functions/submit-swipe/index.ts
// Step 5.3 — Submit swipe, update tag scores, handle duplicates
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { requireAuthorizedUser, requireBearerToken } from "../_shared/auth.ts";
import { handleCorsPreflight, handleFunctionError, jsonResponse, parseJsonBody } from "../_shared/http.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { updateTagScores } from "../_shared/tagScoring.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCorsPreflight(req);
  if (corsResponse) {
    return corsResponse;
  }

  if (req.method !== "POST") return jsonResponse({ message: "Method not allowed" }, 405);

  try {
    // 1. Parse POST body
    const body = await parseJsonBody<{
      user_id?: string;
      item_id?: string;
      direction?: "like" | "skip";
    }>(req);

    const userId = body.user_id;
    const itemId = body.item_id;
    const direction = body.direction;

    if (!userId || !itemId || !direction) {
      return jsonResponse({ message: "Missing required fields: user_id, item_id, direction" }, 400);
    }

    if (direction !== "like" && direction !== "skip") {
      return jsonResponse({ message: "direction must be 'like' or 'skip'" }, 400);
    }

    // 2. Validate JWT
    const jwt = requireBearerToken(req);
    const supabase = createAdminClient();
    await requireAuthorizedUser(supabase, jwt, userId);

    // 3. Insert swipe (handle duplicate: UNIQUE user_id, item_id)
    const { error: insertError } = await supabase.from("swipes").insert({
      user_id: userId,
      item_id: itemId,
      direction,
    });

    // Duplicate swipe = idempotent, return ok
    if (insertError) {
      const isDuplicate = insertError.code === "23505"; // unique_violation
      if (isDuplicate) {
        return jsonResponse({ ok: true });
      }
      throw insertError;
    }

    // 4. Load inspiration item tags
    const { data: item, error: itemError } = await supabase
      .from("inspiration_items")
      .select("tags")
      .eq("id", itemId)
      .single();

    if (itemError || !item?.tags) {
      // Item might have been deleted; swipe was recorded, return ok
      return jsonResponse({ ok: true });
    }

    // 5. Load profile tag_scores
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("tag_scores")
      .eq("id", userId)
      .single();
    if (profileError) {
      throw profileError;
    }

    const tagScores = profile?.tag_scores ?? {};

    // 6. Update tag_scores and persist
    const newScores = updateTagScores(tagScores, item.tags, direction);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ tag_scores: newScores })
      .eq("id", userId);
    // Fail fast on write errors so clients can retry instead of assuming success.
    if (updateError) {
      throw updateError;
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("submit-swipe error:", error);
    return handleFunctionError(error, "SUBMIT_SWIPE_ERROR");
  }
});
