"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface dark:bg-surface-container-lowest rounded-t-3xl px-4 pt-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            <div className="mx-auto w-10 h-1 rounded-full bg-outline-variant/40 mb-5" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
