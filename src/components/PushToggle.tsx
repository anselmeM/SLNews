"use client";

import { useState, useEffect, useCallback } from "react";
import { vibrate } from "@/lib/haptics";

function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

export default function PushToggle() {
  const [subscribed, setSubscribed] = useState(false);
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    navigator.serviceWorker.ready.then((reg) => {
      setSupported(true);
      reg.pushManager.getSubscription().then((sub) => {
        setSubscribed(!!sub);
      });
    });
  }, []);

  const toggle = useCallback(async () => {
    setLoading(true);
    vibrate();
    try {
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
      } else {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(vapidKey),
        });

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint, keys: sub.toJSON().keys }),
        });

        setSubscribed(true);
      }
    } catch (err) {
      console.error("Push toggle error:", err);
    }
    setLoading(false);
  }, [subscribed]);

  if (!supported) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
        subscribed
          ? "bg-primary/10 text-primary"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
      }`}
      title={subscribed ? "Notifications on" : "Notifications off"}
    >
      <span className="material-symbols-outlined text-[16px]">
        {subscribed ? "notifications_active" : "notifications_off"}
      </span>
      <span className="hidden sm:inline">{subscribed ? "On" : "Off"}</span>
    </button>
  );
}
