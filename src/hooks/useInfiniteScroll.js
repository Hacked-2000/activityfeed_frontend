import { useEffect, useRef } from "react";

// fires callback when the sentinel element scrolls into view
const useInfiniteScroll = (callback, hasMore) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) callback();
      },
      { threshold: 0.1 }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => { if (el) observer.unobserve(el); };
  }, [callback, hasMore]);

  return sentinelRef;
};

export default useInfiniteScroll;
