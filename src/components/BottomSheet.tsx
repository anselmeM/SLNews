"use client";

import { m, AnimatePresence, type PanInfo } from "framer-motion";
import { useEffect } from "react";
import { vibrateLight } from "@/lib/haptics";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  // Lock background scroll when open & listen for Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        vibrateLight();
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // If dragged down past threshold or flicked downwards with velocity
    if (info.offset.y > 80 || info.velocity.y > 250) {
      vibrateLight();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center pointer-events-auto">
          {/* Backdrop Blur */}
          <m.div
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              vibrateLight();
              onClose();
            }}
            aria-hidden="true"
          />

          {/* Draggable Bottom Sheet */}
          <m.div
            className="relative w-full max-w-lg bg-surface dark:bg-surface-container-lowest rounded-t-[28px] px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom,16px))] shadow-[0_-12px_40px_rgba(0,0,0,0.2)] border-t border-outline-variant/30 select-none z-10 touch-none max-h-[90vh] flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            aria-label={title || "Dialog Sheet"}
          >
            {/* Native Drag Pill Handle */}
            <div className="mx-auto w-12 h-1.5 rounded-full bg-outline-variant/60 active:bg-primary transition-colors my-2 cursor-grab active:cursor-grabbing" />

            {title && (
              <div className="text-center font-bold text-on-surface text-base mb-3 border-b border-outline-variant/20 pb-2">
                {title}
              </div>
            )}

            <div className="overflow-y-auto overscroll-contain flex-1 touch-pan-y">
              {children}
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
