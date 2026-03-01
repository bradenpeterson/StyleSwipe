import { callEdgeFunction } from '../core/edgeFunctionClient';
import { supabase } from '../../lib/supabase';

export async function getMyStyleItems({ token, userId }) {
  const payload = await callEdgeFunction({
    name: 'my-style',
    method: 'GET',
    token,
    query: { user_id: userId },
  });
  return payload?.items ?? [];
}

export async function getUserTagScores(userId) {
  const result = await supabase.from('profiles').select('tag_scores').eq('id', userId).single();
  if (result.error) throw result.error;
  return result.data?.tag_scores ?? {};
}

export function deriveTopTags(tagScores, count = 5) {
  if (!tagScores || typeof tagScores !== 'object') return [];
  return Object.entries(tagScores)
    .sort((a, b) => {
      const scoreDiff = b[1] - a[1];
      if (scoreDiff !== 0) return scoreDiff;
      return a[0].localeCompare(b[0]);
    })
    .slice(0, count)
    .map(([tag]) => tag);
}
