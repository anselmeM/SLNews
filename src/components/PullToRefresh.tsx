"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { vibrate } from "@/lib/haptics";

const PULL_THRESHOLD = 64;
const MAX_PULL = 140;
const BOUNCE_BACK = "cubic-bezier(0.34, 1.56, 0.64, 1)";

type Props = {
  onRefresh: () => Promise<"ok" | "empty" | "error">;
  children: React.ReactNode;
};

export default function PullToRefresh({ onRefresh, children }: Props) {
  const [pullDist, setPullDist] = useState(0);
  const [phase, setPhase] = useState<"idle" | "pulling" | "ready" | "refreshing">("idle");
  const [message, setMessage] = useState("");
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const refreshingRef = useRef(false);

  const reset = useCallback(() => {
    setPullDist(0);
    setPhase("idle");
  }, []);

  const doRefresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setPhase("refreshing");
    setPullDist(56);
    vibrate(20);
    try {
      const result = await onRefresh();
      if (result === "ok") {
        setMessage("Fresh stories loaded");
      } else if (result === "empty") {
        setMessage("You're all caught up");
      } else {
        setMessage("Couldn't refresh. Try again.");
      }
    } catch {
      setMessage("Couldn't refresh. Try again.");
    } finally {
      refreshingRef.current = false;
      setTimeout(() => {
        reset();
      }, 1200);
    }
  }, [onRefresh, reset]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshingRef.current) return;
    if (window.scrollY > 2 || containerRef.current?.scrollTop && containerRef.current.scrollTop > 2) return;
    startY.current = e.touches[0]!.clientY;
    setPhase("pulling");
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (phase === "idle" || refreshingRef.current) return;
    const dist = e.touches[0]!.clientY - startY.current;
    if (dist < 0) return;
    const damped = Math.min(dist * 0.45, MAX_PULL);
    setPullDist(damped);
    setPhase(damped >= PULL_THRESHOLD ? "ready" : "pulling");
  }, [phase]);

  const handleTouchEnd = useCallback(() => {
    if (phase === "ready") {
      doRefresh();
    } else if (phase === "pulling") {
      reset();
    }
  }, [phase, doRefresh, reset]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startMouseY = 0;
    let pulling = false;

    const onMouseDown = (e: MouseEvent) => {
      if (refreshingRef.current) return;
      if (window.scrollY > 2) return;
      startMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (refreshingRef.current) return;
      if (startMouseY === 0) return;
      const dist = e.clientY - startMouseY;
      if (dist > 20 && !pulling) {
        pulling = true;
        setPhase("pulling");
      }
      if (pulling) {
        const damped = Math.min(dist * 0.45, MAX_PULL);
        setPullDist(damped);
        setPhase(damped >= PULL_THRESHOLD ? "ready" : "pulling");
      }
    };

    const onMouseUp = () => {
      startMouseY = 0;
      if (pulling) {
        pulling = false;
        if (pullDist >= PULL_THRESHOLD) {
          doRefresh();
        } else {
          reset();
        }
      }
    };

    el.addEventListener("mousedown", onMouseDown, { passive: true });
    el.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [pullDist, doRefresh, reset]);

  const indicatorIcon =
    phase === "refreshing" ? "sync"
    : phase === "ready" ? "arrow_upward"
    : "arrow_downward";

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: phase !== "idle" ? `translateY(${pullDist}px)` : undefined,
        transition: phase === "idle" ? `transform 0.3s ${BOUNCE_BACK}` : undefined,
      }}
    >
      <div
        style={{
          height: phase !== "idle" ? `${pullDist}px` : "0px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: phase === "idle" ? `height 0.3s ${BOUNCE_BACK}` : undefined,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className={`material-symbols-outlined text-on-surface-variant transition-transform duration-150 ${
              phase === "refreshing" ? "animate-spin" : ""
            } ${
              phase === "ready" ? "rotate-180" : ""
            }`}
            style={{ fontSize: "20px" }}
          >
            {indicatorIcon}
          </span>
          <span className="text-xs text-on-surface-variant font-medium">
            {phase === "refreshing" ? "Loading fresh news..."
              : phase === "ready" ? "Release to refresh"
              : message || "Pull to refresh"}
            {message && phase !== "refreshing" && ` — ${message}`}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
