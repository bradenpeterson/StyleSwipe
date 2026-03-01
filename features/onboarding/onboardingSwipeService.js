import { requireAccessToken } from '../core/authSession';
import { submitSwipeDecision } from '../swipeFeed/swipeFeedService';
import { supabase } from '../../lib/supabase';

function shuffleInPlace(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

async function loadFromTableByOnboardingFlag(tableName) {
  return supabase
    .from(tableName)
    .select('id, image_url, tags, source')
    .eq('is_onboarding', true)
    .limit(100);
}

async function loadFromTableBySeedSource(tableName) {
  return supabase
    .from(tableName)
    .select('id, image_url, tags, source')
    .eq('source', 'onboarding_seed')
    .limit(100);
}

async function loadFallbackFromAnySource(tableName) {
  return supabase
    .from(tableName)
    .select('id, image_url, tags, source')
    .limit(100);
}

async function tryLoadOnboardingRows(tableName) {
  let result = await loadFromTableByOnboardingFlag(tableName);

  // If the onboarding column hasn't been migrated yet, fallback to seeded source rows.
  if (result.error?.code === '42703') {
    result = await loadFromTableBySeedSource(tableName);
  }

  if (result.error) {
    return { rows: null, error: result.error };
  }

  if ((result.data ?? []).length > 0) {
    return { rows: result.data, error: null };
  }

  // Last resort: pull random inspiration so onboarding remains usable.
  const fallback = await loadFallbackFromAnySource(tableName);
  return {
    rows: fallback.data ?? [],
    error: fallback.error ?? null,
  };
}

export async function fetchOnboardingCards({ limit = 8 }) {
  const tableCandidates = ['inspiration_items', 'inspiration_item'];
  let lastError = null;

  for (const tableName of tableCandidates) {
    const { rows, error } = await tryLoadOnboardingRows(tableName);
    if (!error) {
      return shuffleInPlace(rows ?? []).slice(0, limit);
    }

    // 42P01 = undefined table; try next naming variant.
    if (error.code === '42P01') {
      lastError = error;
      continue;
    }

    throw error;
  }

  if (lastError) {
    throw lastError;
  }

  return [];
}

export async function submitOnboardingSwipe({ userId, itemId, direction }) {
  const token = await requireAccessToken();
  await submitSwipeDecision({
    token,
    userId,
    itemId,
    direction,
  });
}

export async function markOnboardingComplete(userId) {
  const { error } = await supabase
    .from('profiles')
    .update({ has_onboarded: true })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}
