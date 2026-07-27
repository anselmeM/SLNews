"use client";

import Script from "next/script";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";

// Replace with your Google AdSense publisher ID
const PUBLISHER_ID = "ca-pub-xxxxxxxxxxxxxxxx";

// Sample sponsored content (replace with real ads later)
const SPONSORED = [
  {
    title: "Build Your MVP in 2 Weeks",
    description: "Stop building features nobody asked for. Validate first with FirstMileDev.",
    href: "https://firstmiledev.ca",
    label: "Sponsored",
  },
  {
    title: "The 50% Rule: Validate Before You Build",
    description: "Free guide. Learn how to test your idea before writing a line of code.",
    href: "https://firstmiledev.ca",
    label: "Sponsored",
  },
];

export function AdSenseScript() {
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
 * Native in-feed ad card — blends into the article feed layout.
 * Shows a sponsored post that looks like a regular article card.
 */
export function NativeAdCard({ index = 0 }: { index?: number }) {
  const dataSaver = useAppStore((s) => s.dataSaver);
  if (dataSaver) return null;

  const ad = SPONSORED[index % SPONSORED.length];

  return (
    <Link
      href={ad.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {ad.label}
          </span>
        </div>
        <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm md:text-base">
          {ad.title}
        </h3>
        <p className="text-xs md:text-sm text-on-surface-variant mt-1 leading-relaxed">
          {ad.description}
        </p>
      </div>
    </Link>
  );
}

/**
 * Google AdSense native banner — responsive, respects Data Saver.
 */
export function AdBanner({ slot }: { slot: string }) {
  const dataSaver = useAppStore((s) => s.dataSaver);
  if (dataSaver) return null;

  return (
    <div className="my-4">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
