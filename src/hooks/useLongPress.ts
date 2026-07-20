"use client";

import { useCallback, useRef } from "react";

export function useLongPress(
  callback: () => void,
  ms = 500
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);

  const start = useCallback(() => {
    triggeredRef.current = false;
    timerRef.current = setTimeout(() => {
      triggeredRef.current = true;
      callback();
    }, ms);
  }, [callback, ms]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    return triggeredRef.current;
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
  };
}
