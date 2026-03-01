import { useState, useEffect, useCallback } from 'react';
import { requireAccessToken } from '../features/core/authSession';
import { deriveTopTags, getMyStyleItems, getUserTagScores } from '../features/myStyle/myStyleService';

/**
 * useMyStyle(userId)
 * Fetches liked inspiration items (my-style EF) and profile tag_scores for Style DNA.
 * Returns { items, topTags, loading, error, refetch }.
 */
export function useMyStyle(userId) {
  const [items, setItems] = useState([]);
  const [tagScores, setTagScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await requireAccessToken();
      const [fetchedItems, profileResult] = await Promise.all([
        getMyStyleItems({ token, userId }),
        getUserTagScores(userId),
      ]);
      setItems(fetchedItems);
      setTagScores(profileResult);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    refetch();
  }, [userId, refetch]);

  const topTags = deriveTopTags(tagScores);

  return { items, topTags, loading, error, refetch };
}
