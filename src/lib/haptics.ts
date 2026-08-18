"use client";

export function vibrate(ms = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}

export function vibrateLight() {
  vibrate(10);
}

export function vibrateSuccess() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([10, 30, 15]);
  }
}

export function vibrateWarning() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([20, 40, 20]);
  }
}
