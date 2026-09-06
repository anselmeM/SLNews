"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect } from "react";
import {
  type AdSlotId,
  type AdSlotFormat,
  type SponsorCampaign,
  getActiveSponsorCampaign,
} from "@/lib/sponsor-config";
import { useAppStore } from "@/store/useAppStore";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

const PUBLISHER_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID ||
  "";

const IS_VALID_PUBLISHER =
  Boolean(PUBLISHER_ID) &&
  PUBLISHER_ID.startsWith("ca-pub-") &&
  !PUBLISHER_ID.includes("xxxx");

/**
 * Loads the Google AdSense script asynchronously when a valid publisher ID is present.
 */
export function AdSenseScript() {
  if (!IS_VALID_PUBLISHER) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

/**
 * Direct Partner Sponsor Card component.
 * Renders verified local business partner campaigns with high-impact styling.
 */
function DirectSponsorCard({
  campaign,
  format = "rectangle",
}: {
  campaign: SponsorCampaign;
  format?: AdSlotFormat;
}) {
  if (format === "infeed") {
    return (
      <Link
        href={campaign.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 md:p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all group"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {campaign.badge || "Sponsored"}
          </span>
          <span className="material-symbols-outlined text-xs text-on-surface-variant opacity-60 group-hover:text-primary transition-colors">
            open_in_new
          </span>
        </div>
        <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm md:text-base leading-snug">
          {campaign.title}
        </h3>
        <p className="text-xs md:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
          {campaign.description}
        </p>
        {campaign.ctaText && (
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
            <span>{campaign.ctaText}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        )}
      </Link>
    );
  }

  if (format === "horizontal" || format === "banner") {
    return (
      <Link
        href={campaign.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {campaign.badge || "Partner"}
              </span>
            </div>
            <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm sm:text-base">
              {campaign.title}
            </h4>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 line-clamp-2">
              {campaign.description}
            </p>
          </div>
          {campaign.ctaText && (
            <div className="shrink-0 flex items-center justify-center bg-primary text-on-primary font-semibold text-xs px-4 py-2 rounded-full group-hover:opacity-90 transition-opacity">
              {campaign.ctaText}
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Default: rectangle format (ideal for in-article)
  return (
    <div className="my-6 p-4 sm:p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {campaign.badge || "Sponsored"}
        </span>
        <span className="text-[10px] text-on-surface-variant/60 font-medium">
          Advertisement
        </span>
      </div>
      <h4 className="font-bold text-on-surface text-base mb-1.5">
        {campaign.title}
      </h4>
      <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
        {campaign.description}
      </p>
      <Link
        href={campaign.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 bg-primary text-on-primary font-semibold text-xs px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
      >
        <span>{campaign.ctaText || "Learn More"}</span>
        <span className="material-symbols-outlined text-xs">open_in_new</span>
      </Link>
    </div>
  );
}

/**
 * Universal Ad Slot component.
 * 1. Prioritizes active direct Sierra Leone business partner campaigns.
 * 2. Falls back to Google AdSense when no direct partner ad is scheduled.
 * 3. Gracefully hides or adapts under Data Saver Mode.
 */
export function AdSlot({
  slotId,
  format = "rectangle",
  category,
  googleAdSlot,
  className = "",
}: {
  slotId: AdSlotId;
  format?: AdSlotFormat;
  category?: string;
  googleAdSlot?: string;
  className?: string;
}) {
  const dataSaver = useAppStore((s) => s.dataSaver);
  const partnerCampaign = getActiveSponsorCampaign(slotId, category);

  useEffect(() => {
    if (!partnerCampaign && IS_VALID_PUBLISHER && googleAdSlot) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // Safe catch for adblockers or strict script blockers
      }
    }
  }, [partnerCampaign, googleAdSlot]);

  if (dataSaver) return null;

  // 1. Direct Business Partner Campaign
  if (partnerCampaign) {
    return (
      <div className={`w-full ${className}`}>
        <DirectSponsorCard campaign={partnerCampaign} format={format} />
      </div>
    );
  }

  // 2. Google AdSense Fallback
  if (IS_VALID_PUBLISHER && googleAdSlot) {
    return (
      <div className={`w-full my-4 min-h-[90px] overflow-hidden ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={googleAdSlot}
          data-ad-format={format === "rectangle" ? "rectangle" : "auto"}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // No active ad network or campaign: return null to avoid empty whitespace
  return null;
}

/**
 * Legacy compatibility helper for in-feed article lists.
 */
export function NativeAdCard() {
  return <AdSlot slotId="feed_native" format="infeed" />;
}

/**
 * Legacy compatibility helper for general AdBanner slots.
 */
export function AdBanner({ slot }: { slot: string }) {
  return <AdSlot slotId="article_bottom" format="horizontal" googleAdSlot={slot} />;
}
