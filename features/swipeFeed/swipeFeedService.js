import { callEdgeFunction } from '../core/edgeFunctionClient';

export async function getSwipeFeed({ token, userId, limit = 20 }) {
  const payload = await callEdgeFunction({
    name: 'swipe-feed',
    method: 'GET',
    token,
    query: {
      user_id: userId,
      limit,
    },
  });
  return payload?.items ?? [];
}

export async function submitSwipeDecision({ token, userId, itemId, direction }) {
  await callEdgeFunction({
    name: 'submit-swipe',
    method: 'POST',
    token,
    body: {
      user_id: userId,
      item_id: itemId,
      direction,
    },
  });
}
