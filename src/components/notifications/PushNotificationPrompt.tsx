"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Toast";

function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

interface PushNotificationPromptProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export default function PushNotificationPrompt({
  isOpen,
  onClose,
  title = "Turn on Real-Time Alerts",
  description = "Get instant lockscreen notifications for commodity price shifts, currency rate movements, and breaking stories across Sierra Leone.",
  onSuccess,
}: PushNotificationPromptProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleEnable = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        toast("Push notifications are not supported by your browser", "error");
        onClose();
        return;
      }

      if (Notification.permission === "denied") {
        toast("Notifications are blocked in your browser settings", "error");
        onClose();
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        toast("Push notifications are not configured yet", "error");
        onClose();
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(vapidKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint, keys: sub.toJSON().keys }),
      });

      if (res.ok) {
        toast("Notifications enabled! You'll receive instant updates. 🔔", "success");
        onSuccess?.();
        onClose();
      } else {
        toast("Failed to enable notifications. Please try again.", "error");
      }
    } catch (err) {
      console.error("Enable push error:", err);
      toast("Could not enable notifications", "error");
    } finally {
      setLoading(false);
    }
  }, [loading, onClose, onSuccess, toast]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="push-prompt-title"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md rounded-3xl bg-surface border border-outline-variant/30 p-6 sm:p-7 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[16px]">notifications_active</span>
            Instant Alerts
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center text-on-surface-variant cursor-pointer"
            aria-label="Close dialog"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-2 mb-6">
          <h2 id="push-prompt-title" className="text-xl sm:text-2xl font-black text-on-surface tracking-tight leading-snug">
            {title}
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
            {description}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 mb-6 space-y-2.5 text-xs text-on-surface">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">trending_up</span>
            <span className="font-semibold">Track Le / USD & commodity prices in real time</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">campaign</span>
            <span className="font-semibold">Breaking news broadcasts directly to your lockscreen</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">wb_sunny</span>
            <span className="font-semibold">7:00 AM Morning audio briefing for Freetown & Provinces</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleEnable}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-primary text-white hover:bg-primary/95 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            <span>{loading ? "Enabling..." : "Enable Push Notifications"}</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl font-bold text-sm bg-surface-container text-on-surface hover:bg-surface-container-high transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Not Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
