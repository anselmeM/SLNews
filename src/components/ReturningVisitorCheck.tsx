"use client";

import { useEffect } from "react";

export default function ReturningVisitorCheck({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.cookie = "slnews_visited=1; path=/; max-age=" + 60 * 60 * 24 * 365;
  }, []);

  return <>{children}</>;
}
