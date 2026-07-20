"use client";

export function vibrate(ms = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}
