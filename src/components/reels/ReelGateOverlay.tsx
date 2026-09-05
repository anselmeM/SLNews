"use client";

import Link from "next/link";

export default function ReelGateOverlay() {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-sm text-center space-y-5">
        {/* Animated Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/30 shadow-[0_0_24px_rgba(30,142,62,0.35)]">
            <span className="material-symbols-outlined text-3xl">
              smart_display
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs shadow-md">
            <span className="material-symbols-outlined text-[16px]">lock</span>
          </div>
        </div>

        {/* Heading & Copy */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            Free Preview Limit Reached
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
            Unlock Unlimited Video Reels
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xs mx-auto">
            You&apos;ve enjoyed 2 free video clips. Create a free account to watch
            unlimited broadcasts, citizen reports, and viral stories from across
            Sierra Leone.
          </p>
        </div>

        {/* Member Value Checklist */}
        <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-left space-y-2 text-xs text-neutral-200">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
              check_circle
            </span>
            <span>Unlimited access to all news shorts & reels</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
              favorite
            </span>
            <span>Like, bookmark, and share community clips</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
              videocam
            </span>
            <span>Submit your own eyewitness videos</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          <Link
            href="/sign-up"
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
          >
            <span>Create Free Account</span>
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </Link>
          <Link
            href="/sign-in"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl font-semibold text-sm bg-neutral-800 text-white hover:bg-neutral-700 transition-all active:scale-[0.98]"
          >
            <span>Already a member? Sign In</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white pt-2 inline-flex items-center justify-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Return to News Home
          </Link>
        </div>
      </div>
    </div>
  );
}
