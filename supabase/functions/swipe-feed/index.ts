// supabase/functions/swipe-feed/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { requireAuthorizedUser, requireBearerToken } from "../_shared/auth.ts";
import { handleCorsPreflight, handleFunctionError, jsonResponse, parseLimit } from "../_shared/http.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { MOCK_ITEMS } from "./mockInspiration.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCorsPreflight(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    // 1. Validate JWT
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");
    const limit = parseLimit(url);

    if (!userId) {
      return jsonResponse({ message: "Missing user_id query param" }, 400);
    }

    const jwt = requireBearerToken(req);

    // 2. Initialize Supabase client with service role
    const supabase = createAdminClient();
    await requireAuthorizedUser(supabase, jwt, userId);

    // 3. Load profile (tag_scores)
    const { data: profile } = await supabase
      .from("profiles")
      .select("tag_scores")
      .eq("id", userId)
      .single();

    const tagScores = profile?.tag_scores || {};

    // 4. Get seen item_ids
    const { data: seenData } = await supabase
      .from("swipes")
      .select("item_id")
      .eq("user_id", userId)
      .limit(5000); // Bound to avoid large subquery

    const seenIds = seenData?.map((s: any) => s.item_id) || [];

    // 5. Fetch unseen inspiration items
    let query = supabase
      .from("inspiration_items")
      .select("*")
      .limit(limit);

    if (seenIds.length > 0) {
      // PostgREST format: (uuid1,uuid2) — UUIDs need double quotes
      query = query.not(
        "id",
        "in",
        `(${seenIds.map((id) => `"${id}"`).join(",")})`
      );
    }

    let items = (await query).data ?? [];

    // When DB has no (or no unseen) items, use mock outfit images
    if (items.length === 0) {
      const seenSet = new Set(seenIds);
      items = MOCK_ITEMS.filter((item) => !seenSet.has(item.id)).slice(0, limit);
    }

    // 6. Score and sort (in JavaScript)
    const scored = items.map((item: any) => ({
      ...item,
      score: scoreItem(item, tagScores),
    }));

    scored.sort((a, b) => b.score - a.score);

    const result = scored.map((item: any) => ({
      id: item.id,
      image_url: item.image_url,
      tags: item.tags,
      source: item.source,
    }));

    return jsonResponse({ items: result });
  } catch (error) {
    console.error("swipe-feed error:", error);
    return handleFunctionError(error, "FEED_ERROR");
  }
});

// Helper: score an item by average tag affinity
function scoreItem(item: any, tagScores: any): number {
  if (!item.tags || item.tags.length === 0) return 0;
  const sum = item.tags.reduce((acc: number, tag: string) => {
    return acc + (tagScores[tag] ?? 0);
  }, 0);
  return sum / item.tags.length;
}
