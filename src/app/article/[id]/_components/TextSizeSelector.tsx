"use client";

import { vibrate } from "@/lib/haptics";
import { useAppStore, type FontSize } from "@/store/useAppStore";

export default function TextSizeSelector() {
  const fontSize = useAppStore((state) => state.fontSize);
  const setFontSize = useAppStore((state) => state.setFontSize);

  const cycleSize = () => {
    vibrate(10);
    const next: Record<FontSize, FontSize> = {
      normal: "large",
      large: "xlarge",
      xlarge: "normal",
    };
    setFontSize(next[fontSize] || "normal");
  };

  const labelMap: Record<FontSize, string> = {
    normal: "1x",
    large: "1.2x",
    xlarge: "1.4x",
  };

  return (
    <button
      onClick={cycleSize}
      aria-label={`Adjust text size (Current: ${fontSize})`}
      title={`Adjust text size (Current: ${fontSize})`}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
    >
      <span className="material-symbols-outlined text-[16px]">format_size</span>
      <span>{labelMap[fontSize] || "1x"}</span>
    </button>
  );
}
