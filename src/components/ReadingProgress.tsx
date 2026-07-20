"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const st = h.scrollTop || document.body.scrollTop;
      const sh = h.scrollHeight - h.clientHeight;
      setProgress(sh > 0 ? Math.min(st / sh, 1) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-50 bg-transparent pointer-events-none">
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out rounded-r-sm"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
