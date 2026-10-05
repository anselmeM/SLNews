"use client";

import { useEffect } from "react";
import { recordVisitAndReport } from "@/lib/retention-client";

/**
 * Reports one anonymous "first visit today / return visit" per device per day,
 * so the app can tell whether readers come back. The visit log itself stays in
 * local storage; see `src/lib/retention.ts`.
 */
export default function RetentionPing() {
  useEffect(() => {
    void recordVisitAndReport();
  }, []);

  return null;
}
