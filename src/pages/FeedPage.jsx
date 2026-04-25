import { useState, useEffect, useCallback, useRef, memo } from "react";
import { getActivities } from "../services/activity.service";
import ActivityItem from "../components/ActivityItem";
import ActivityFilter from "../components/ActivityFilter";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { showError } from "../utils/toast";

const DEMO_TENANT = "tenant_001";
const POLL_INTERVAL = 15000;

// memoised so it only re-renders when the activity object reference changes
const MemoActivityItem = memo(ActivityItem);

const FeedPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState("all");

  // refs so callbacks always read the latest values without being re-created
  const cursorRef = useRef(null);
  const filterRef = useRef("all");
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(false);

  cursorRef.current = cursor;
  filterRef.current = filter;
  loadingMoreRef.current = loadingMore;
  hasMoreRef.current = hasMore;

  const buildParams = useCallback((nextCursor, activeFilter) => ({
    limit: 20,
    ...(nextCursor && { cursor: nextCursor }),
    ...(activeFilter !== "all" && { type: activeFilter }),
  }), []);

  const fetchFeed = useCallback(async (nextCursor = null, activeFilter = "all") => {
    const res = await getActivities(DEMO_TENANT, buildParams(nextCursor, activeFilter), null);

    if (!res?.success) {
      showError(res?.message || "Failed to load feed");
      return;
    }

    // append on pagination, replace on fresh load or filter change
    setActivities((prev) => nextCursor ? [...prev, ...res.data] : res.data);
    setCursor(res.nextCursor);
    setHasMore(res.hasMore);
  }, [buildParams]);

  // initial load
  useEffect(() => {
    setLoading(true);
    fetchFeed(null, "all").finally(() => setLoading(false));
  }, [fetchFeed]);

  // re-fetch when filter changes — reset everything first
  useEffect(() => {
    setLoading(true);
    setActivities([]);
    setCursor(null);
    setHasMore(false);
    fetchFeed(null, filter).finally(() => setLoading(false));
  }, [filter]); // fetchFeed is stable, intentionally omitted to avoid double-fire on mount

  // real-time polling — prepends only new items, respects active filter
  useEffect(() => {
    const poll = async () => {
      const res = await getActivities(
        DEMO_TENANT,
        buildParams(null, filterRef.current),
        null
      );
      if (!res?.success) return;

      setActivities((prev) => {
        const existingIds = new Set(prev.map((a) => a._id));
        const fresh = res.data.filter((a) => !existingIds.has(a._id));
        return fresh.length > 0 ? [...fresh, ...prev] : prev;
      });
    };

    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [buildParams]); // buildParams is stable — this runs once

  // infinite scroll via IntersectionObserver — stable callback via refs
  const handleLoadMore = useCallback(() => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    setLoadingMore(true);
    fetchFeed(cursorRef.current, filterRef.current).finally(() =>
      setLoadingMore(false)
    );
  }, [fetchFeed]);

  const sentinelRef = useInfiniteScroll(handleLoadMore, hasMore && !loadingMore);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Feed</h1>
          <p className="page-subtitle">
            {DEMO_TENANT} · live · auto-refreshes every 15s
          </p>
        </div>
      </div>

      <ActivityFilter active={filter} onChange={setFilter} />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
          <div className="spinner" />
        </div>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing here yet</h3>
          <p>
            {filter !== "all"
              ? `No "${filter.replace("_", " ")}" events found.`
              : "Post some activities to see them here."}
          </p>
        </div>
      ) : (
        <div className="feed-container">
          {activities.map((a) => (
            <MemoActivityItem key={a._id} activity={a} />
          ))}

          {/* IntersectionObserver sentinel */}
          <div ref={sentinelRef} style={{ height: 1 }} />

          {loadingMore && (
            <div style={{ display: "flex", justifyContent: "center", padding: "16px" }}>
              <div className="spinner" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
