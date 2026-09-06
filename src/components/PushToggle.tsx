"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Toast";
import { vibrate } from "@/lib/haptics";

function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

export default function PushToggle() {
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState(false);
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    navigator.serviceWorker.ready.then((reg) => {
      setSupported(true);
      reg.pushManager.getSubscription().then((sub) => {
        setSubscribed(!!sub);
      });
    }).catch(() => {});
  }, []);

  const toggle = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    vibrate();

    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "denied") {
          toast("Notifications are blocked in your browser settings", "error");
          setLoading(false);
          return;
        }
      }

      const reg = await navigator.serviceWorker.ready;

      if (subscribed) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
        }
        setSubscribed(false);
        toast("Push notifications turned off", "info");
      } else {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          toast("Push notifications are not configured yet", "error");
          setLoading(false);
          return;
        }

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
          setSubscribed(true);
          toast("Breaking news & price alerts enabled! 🔔", "success");
        } else {
          toast("Failed to enable notifications. Please try again.", "error");
        }
      }
    } catch (err) {
      console.error("Push toggle error:", err);
      toast("Could not update notification preferences", "error");
    } finally {
      setLoading(false);
    }
  }, [subscribed, loading, toast]);

  if (!supported) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
        subscribed
          ? "bg-primary/10 text-primary border border-primary/20"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
      }`}
      title={subscribed ? "Notifications active" : "Enable breaking news alerts"}
      aria-label={subscribed ? "Notifications active" : "Enable notifications"}
    >
      <span className="material-symbols-outlined text-[16px]">
        {subscribed ? "notifications_active" : "notifications_off"}
      </span>
      <span className="hidden sm:inline">{subscribed ? "Alerts On" : "Alerts"}</span>
    </button>
  );
}
