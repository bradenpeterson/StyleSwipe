import { useState, useEffect, useCallback, useRef } from 'react';
import { requireAccessToken } from '../features/core/authSession';
import { getSwipeFeed, submitSwipeDecision } from '../features/swipeFeed/swipeFeedService';

// Fallback when swipe-feed returns no items (empty DB or all swiped) so user sees outfit images.
// Set EXPO_PUBLIC_USE_MOCK_FEED=true to always use mock outfit images (ignores DB).
const MOCK_INSPIRATION = require('../data/mock-inspiration.json').items;
const USE_MOCK_FEED = process.env.EXPO_PUBLIC_USE_MOCK_FEED === 'true';

function mergeUniqueById(existingItems, incomingItems) {
  const seen = new Set(existingItems.map((item) => item?.id));
  const next = [...existingItems];
  for (const item of incomingItems) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    next.push(item);
  }
  return next;
}

/**
 * useSwipeFeed(userId, initialLimit?)
 * Returns { queue, loading, error, submitSwipe, fetchMore }.
 * Fetches from swipe-feed (GET query params); submitSwipe calls submit-swipe and removes from queue; refetches when queue.length < 3.
 */
export function useSwipeFeed(userId, initialLimit = 20) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const swipeHistoryRef = useRef([]);
  const mountedRef = useRef(true);
  const refillTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refillTimeoutRef.current) {
        clearTimeout(refillTimeoutRef.current);
      }
    };
  }, []);

  const fetchMore = useCallback(
    async (limit = initialLimit) => {
      if (!userId) return;
      try {
        if (!mountedRef.current) return;
        setLoading(true);
        setError(null);
        if (USE_MOCK_FEED) {
          const items = MOCK_INSPIRATION.slice(0, limit);
          // Deduplicate by id so retries/refills do not keep appending the same cards.
          if (mountedRef.current) {
            setQueue((prev) => mergeUniqueById(prev, items));
          }
        } else {
          const token = await requireAccessToken();
          let items = await getSwipeFeed({ token, userId, limit });
          if (!items || items.length === 0) {
            items = MOCK_INSPIRATION.slice(0, limit);
          }
          if (mountedRef.current) {
            setQueue((prev) => mergeUniqueById(prev, items));
          }
        }
      } catch (e) {
        if (mountedRef.current) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [userId, initialLimit]
  );

  const submitSwipe = useCallback(
    async (itemId, direction) => {
      if (!userId) return;
      try {
        const token = await requireAccessToken();
        await submitSwipeDecision({ token, userId, itemId, direction });
      } catch (e) {
        console.error('Submit swipe error:', e);
      }
      setQueue((prev) => {
        const swipedItem = prev.find((item) => item.id === itemId);
        if (swipedItem) {
          swipeHistoryRef.current = [swipedItem, ...swipeHistoryRef.current].slice(0, 3);
        }
        const next = prev.filter((item) => item.id !== itemId);
        if (next.length < 3) {
          // Keep only one queued refill to avoid burst fetches during fast swiping.
          if (refillTimeoutRef.current) clearTimeout(refillTimeoutRef.current);
          refillTimeoutRef.current = setTimeout(() => fetchMore(initialLimit), 0);
        }
        return next;
      });
    },
    [userId, initialLimit, fetchMore]
  );

  const undoLastSwipe = useCallback(() => {
    const [last, ...rest] = swipeHistoryRef.current;
    if (!last) return;
    swipeHistoryRef.current = rest;
    setQueue((prev) => [last, ...prev]);
  }, []);

  useEffect(() => {
    if (refillTimeoutRef.current) {
      // Clear pending refills when session/user changes to avoid stale fetches.
      clearTimeout(refillTimeoutRef.current);
      refillTimeoutRef.current = null;
    }
    if (!userId) {
      setQueue([]);
      setError(null);
      setLoading(false);
      return;
    }
    fetchMore(initialLimit);
  }, [userId, fetchMore, initialLimit]);

  return { queue, loading, error, submitSwipe, fetchMore, undoLastSwipe };
}
