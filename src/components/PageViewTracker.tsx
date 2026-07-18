"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prev = useRef("");

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    if (url === prev.current) return;
    prev.current = url;

    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      navigator.sendBeacon(
        "/api/analytics",
        JSON.stringify({ path: pathname, referrer: document.referrer, ts: Date.now() })
      );
    }
  }, [pathname, searchParams]);

  return null;
}
