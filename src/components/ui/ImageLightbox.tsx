"use client";

import { m, AnimatePresence, type PanInfo } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { vibrateLight } from "@/lib/haptics";

interface ImageLightboxProps {
  isOpen: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({
  isOpen,
  src,
  alt,
  onClose,
}: ImageLightboxProps) {
  const [zoomed, setZoomed] = useState(false);

  const handleClose = useCallback(() => {
    vibrateLight();
    setZoomed(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!zoomed && (Math.abs(info.offset.y) > 80 || Math.abs(info.velocity.y) > 250)) {
      handleClose();
    }
  };

  const handleDoubleTap = () => {
    vibrateLight();
    setZoomed((z) => !z);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center select-none">
          {/* Backdrop */}
          <m.div
            className="fixed inset-0 bg-black/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Top Control Bar */}
          <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pt-[calc(16px+env(safe-area-inset-top,0px))] pointer-events-auto">
            <span className="text-white/70 text-xs font-medium truncate max-w-[240px]">
              {alt}
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white backdrop-blur-md transition-all cursor-pointer"
              aria-label="Close image viewer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Draggable Image Container */}
          <m.div
            className="relative w-full max-w-4xl h-[70vh] sm:h-[80vh] flex items-center justify-center p-4 z-0 touch-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag={zoomed ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            onDoubleClick={handleDoubleTap}
          >
            <div
              className={`relative w-full h-full transition-transform duration-300 ease-out cursor-zoom-in ${
                zoomed ? "scale-150 cursor-zoom-out" : "scale-100"
              }`}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
                unoptimized={src.startsWith("data:")}
              />
            </div>
          </m.div>

          {/* Bottom Hint */}
          <div className="fixed bottom-6 left-0 right-0 text-center pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
            <span className="text-white/50 text-[11px] font-medium bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {zoomed ? "Double tap to zoom out" : "Swipe down to close · Double tap to zoom"}
            </span>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
