"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReturningVisitorCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Set cookie on first visit so middleware redirects next time
    document.cookie = "slnews_visited=1; path=/; max-age=" + 60 * 60 * 24 * 365;
  }, [router]);

  return <>{children}</>;
}
