"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  captureFirstTouchAttribution,
  getStoredAttribution,
} from "@/lib/campaign-attribution";
import { trackCustomMetaEvent } from "@/lib/meta-pixel";

/**
 * Records first-touch campaign attribution from the landing URL and reports it
 * to the Meta Pixel. Mounted once in the root layout so any ad landing (with
 * `utm_*` / `fbclid`) is captured before the reader navigates away.
 */
export default function CampaignAttributionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams?.toString() ?? "";
    if (!search) return;

    const alreadyStored = getStoredAttribution();
    const attribution = captureFirstTouchAttribution({
      search,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      landingPath: pathname,
    });

    // Only report the touch that actually captured credit.
    if (attribution && !alreadyStored) {
      trackCustomMetaEvent("CampaignLanding", {
        source: attribution.source,
        medium: attribution.medium,
        campaign: attribution.campaign,
        content: attribution.content,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
