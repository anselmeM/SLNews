"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { vibrateLight } from "@/lib/haptics";

const EDGE_TRIGGER_WIDTH = 30; // Max distance from left edge to start gesture
const SWIPE_THRESHOLD = 75;    // Drag distance required to trigger back navigation

export default function EdgeSwipeBack() {
  const router = useRouter();
  const pathname = usePathname();
  const [dragX, setDragX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const isEligible = useRef(false);
  const isHorizontal = useRef<boolean | null>(null);

  useEffect(() => {
    // Only enable edge swipe on sub-routes, not on the home feed
    if (pathname === "/" || pathname === "/home") {
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (!touch) return;

      if (touch.clientX <= EDGE_TRIGGER_WIDTH) {
        startX.current = touch.clientX;
        startY.current = touch.clientY;
        isEligible.current = true;
        isHorizontal.current = null;
      } else {
        isEligible.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isEligible.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (!touch) return;
      const deltaX = touch.clientX - startX.current;
      const deltaY = touch.clientY - startY.current;

      // Determine gesture direction on first significant movement
      if (isHorizontal.current === null) {
        if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
          isHorizontal.current = Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0;
        }
      }

      if (isHorizontal.current) {
        // Dragging right
        if (deltaX > 0) {
          // Apply rubber-band damping
          const damped = Math.min(deltaX * 0.7, 120);
          setDragX(damped);
          setIsSwiping(true);
        }
      }
    };

    const handleTouchEnd = () => {
      if (isEligible.current && isHorizontal.current && dragX >= SWIPE_THRESHOLD * 0.7) {
        vibrateLight();
        router.back();
      }

      setIsSwiping(false);
      setDragX(0);
      isEligible.current = false;
      isHorizontal.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [pathname, router, dragX]);

  if (!isSwiping || dragX <= 0) return null;

  const progress = Math.min(dragX / (SWIPE_THRESHOLD * 0.7), 1);

  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 z-[200] pointer-events-none transition-transform duration-75 select-none"
      style={{
        transform: `translate3d(${dragX - 44}px, -50%, 0) scale(${0.8 + progress * 0.2})`,
        opacity: Math.max(progress, 0.2),
      }}
      aria-hidden="true"
    >
      <div className="flex items-center justify-center w-11 h-11 rounded-full bg-surface/90 dark:bg-surface-container-highest/90 backdrop-blur-md shadow-lg border border-outline-variant/40 text-primary">
        <span className="material-symbols-outlined text-2xl font-bold">
          arrow_back
        </span>
      </div>
    </div>
  );
}
