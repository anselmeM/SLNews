"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect, useCallback } from "react";
import type { ReelVideo } from "@/app/actions/reel-actions";
import ReelCard from "@/components/reels/ReelCard";

interface ReelsFeedProps {
  initialReels: ReelVideo[];
}

export default function ReelsFeed({ initialReels }: ReelsFeedProps) {
  const { isSignedIn } = useUser();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToReel = useCallback((index: number) => {
    if (!containerRef.current) return;
    const target = containerRef.current.children[index] as HTMLElement;
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      setActiveIndex(index);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (activeIndex < initialReels.length - 1) {
      scrollToReel(activeIndex + 1);
    }
  }, [activeIndex, initialReels.length, scrollToReel]);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      scrollToReel(activeIndex - 1);
    }
  }, [activeIndex, scrollToReel]);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        handlePrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Track active slide on scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const newIndex = Math.round(scrollTop / clientHeight);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < initialReels.length) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
    >
      {initialReels.map((reel, index) => (
        <ReelCard
          key={reel.id}
          reel={reel}
          isActive={activeIndex === index}
          isLocked={!isSignedIn && index >= 2}
          onNext={index < initialReels.length - 1 ? handleNext : undefined}
          onPrev={index > 0 ? handlePrev : undefined}
        />
      ))}
    </div>
  );
}
