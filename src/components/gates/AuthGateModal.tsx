"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { useEffect, useCallback } from "react";
import { useAuthGateStore, type AuthGateContext } from "@/store/useAuthGateStore";

interface GateContent {
  icon: string;
  badge: string;
  title: string;
  description: string;
}

const GATE_CONFIG: Record<AuthGateContext, GateContent> = {
  bookmark: {
    icon: "bookmark",
    badge: "Saved Articles",
    title: "Save Articles for Offline Reading",
    description:
      "Create a free account to save stories, sync across your phone and tablet, and read anytime without consuming mobile data.",
  },
  reel_watch: {
    icon: "smart_display",
    badge: "Shorts & Video Reels",
    title: "Watch Unlimited Video News Reels",
    description:
      "Join SLNews free to stream full video news broadcasts, citizen reports, and viral clips from across Sierra Leone.",
  },
  reel_like: {
    icon: "favorite",
    badge: "Community Engagement",
    title: "Like & React to Video Reels",
    description:
      "Sign in to like video clips, save your favorites, and support local citizen journalists across the provinces.",
  },
  market_alert: {
    icon: "trending_up",
    badge: "Live Market Intelligence",
    title: "Get Real-Time Price Alerts",
    description:
      "Receive instant WhatsApp and push alerts when rice, fuel, palm oil, or FX prices change in Freetown, Bo, Makeni, or Kenema.",
  },
  comment: {
    icon: "forum",
    badge: "Community Voice",
    title: "Join the Discussion",
    description:
      "Sign in to share your voice, reply to other readers, and participate in Sierra Leone's national conversation with verified members.",
  },
  follow: {
    icon: "loyalty",
    badge: "Personalized Feed",
    title: "Personalize Your News Feed",
    description:
      "Follow categories like Politics, Economy, Sports, and Agriculture to receive a custom news stream curated for you.",
  },
  default: {
    icon: "lock",
    badge: "Member Exclusive",
    title: "Unlock Free Member Access",
    description:
      "Sign up in 10 seconds to unlock unlimited video shorts, offline bookmarks, market price alerts, and personalized news.",
  },
};

export default function AuthGateModal() {
  const { isOpen, context, closeGate } = useAuthGateStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGate();
    },
    [closeGate]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const content = GATE_CONFIG[context] || GATE_CONFIG.default;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeGate}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          <m.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-gate-title"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md rounded-3xl bg-surface border border-outline-variant/30 p-6 sm:p-7 shadow-2xl z-10 overflow-hidden"
          >
            {/* Header / Dismiss button */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[16px]">
                  {content.icon}
                </span>
                {content.badge}
              </span>
              <button
                type="button"
                onClick={closeGate}
                className="w-8 h-8 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center text-on-surface-variant cursor-pointer"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            {/* Main Content */}
            <div className="space-y-2 mb-6">
              <h2
                id="auth-gate-title"
                className="text-xl sm:text-2xl font-black text-on-surface tracking-tight leading-snug"
              >
                {content.title}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
                {content.description}
              </p>
            </div>

            {/* Value bullets */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 mb-6 space-y-2 text-xs text-on-surface">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  check_circle
                </span>
                <span className="font-semibold">
                  100% Free • No subscription fees
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  bolt
                </span>
                <span className="font-semibold">
                  Sign up in 10 seconds with Google or Phone
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <Link
                href="/sign-up"
                onClick={closeGate}
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-primary text-white hover:bg-primary/95 shadow-sm transition-all active:scale-[0.98]"
              >
                <span>Create Free Account</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/sign-in"
                onClick={closeGate}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl font-bold text-sm bg-surface-container text-on-surface hover:bg-surface-container-high transition-all active:scale-[0.98]"
              >
                <span>Already have an account? Sign In</span>
              </Link>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
