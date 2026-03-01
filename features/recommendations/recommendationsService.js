import { callEdgeFunction } from '../core/edgeFunctionClient';

export async function getRecommendations({ token, userId, limit = 20 }) {
  const payload = await callEdgeFunction({
    name: 'recommendations',
    method: 'GET',
    token,
    query: {
      user_id: userId,
      limit,
    },
  });
  return payload?.items ?? [];
}
