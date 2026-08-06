"use client";

import type { ReactNode } from "react";

// Route transition wrapper. Deliberately a plain div — no framer-motion.
// The previous m.div started every page at `opacity: 0` until the animation
// runtime ran; on any page rendered without MotionProvider (e.g. /login) the
// animation never fired and the whole page stayed invisible. A plain div is
// always visible, on every page, in every browser.
export default function Template({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
