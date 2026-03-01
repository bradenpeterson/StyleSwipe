import { useState, useEffect, useCallback } from 'react';
import { requireAccessToken } from '../features/core/authSession';
import { getRecommendations } from '../features/recommendations/recommendationsService';

/**
 * useRecommendations(userId, limit?)
 * Fetches product recommendations from the recommendations Edge Function.
 * Returns { items, loading, error, refetch }.
 */
export function useRecommendations(userId, limit = 20) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await requireAccessToken();
      const fetched = await getRecommendations({ token, userId, limit });
      setItems(fetched);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    refetch();
  }, [userId, refetch]);

  return { items, loading, error, refetch };
}
