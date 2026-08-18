"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useToast } from "@/components/Toast";
import { useNotificationStore } from "@/store/useNotificationStore";

type ToggleItem = {
  key: string;
  label: string;
  desc: string;
  checked: boolean;
  setter: (v: boolean) => void;
};

function getPermissionStatus(): NotificationPermission | "unsupported" {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

export default function NotificationToggles({ toggles }: { toggles: ToggleItem[] }) {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  // Server snapshot is always "unsupported" so the first client render matches
  // SSR (no hydration mismatch); the client snapshot reads the real permission.
  const permission = useSyncExternalStore(
    () => () => {},
    getPermissionStatus,
    () => "unsupported" as const
  );

  const handleSendTestNotification = async () => {
    setTesting(true);
    try {
      if (permission === "unsupported") {
        addNotification({
          title: "Test In-App Notification",
          body: "This is a preview test notification sent to your in-app inbox.",
          url: "/home",
          category: "system",
          icon: "campaign",
        });
        toast("Test notification added to In-App inbox!", "success");
        return;
      }

      if (permission === "default") {
        const result = await Notification.requestPermission();
        if (result !== "granted") {
          toast("Please grant notification permission to receive device alerts.", "info");
        }
      }

      if (Notification.permission === "granted") {
        new Notification("SLNews Breaking Alert", {
          body: "This is a test notification from SLNews. Your alerts are working perfectly!",
          icon: "/icon-192x192.png",
          tag: "slnews-test-alert",
        });
      }

      addNotification({
        title: "Test Alert Verified",
        body: "Your notifications and alert preferences are configured correctly.",
        url: "/notifications",
        category: "system",
        icon: "verified",
      });

      toast("Test alert sent successfully!", "success");
    } catch {
      toast("Could not send test notification.", "error");
    } finally {
      setTesting(false);
    }
  };

  const handleToggle = async (checked: boolean, setter: (v: boolean) => void, label: string) => {
    if (checked) {
      if (permission === "unsupported") {
        setter(true);
        toast(`${label} in-app alerts enabled`, "success");
        return;
      }
      if (permission === "denied") {
        toast("Notifications are blocked in your browser settings.", "error");
        return;
      }
      if (permission === "default") {
        try {
          const result = await Notification.requestPermission();
          if (result === "denied") {
            toast("Notification permission denied.", "error");
            return;
          }
          if (result === "default") {
            return;
          }
        } catch {
          toast("Could not request notification permission.", "error");
          return;
        }
      }

      try {
        new Notification("SLNews Alerts", {
          body: `You'll now receive ${label.toLowerCase()} notifications.`,
          icon: "/icon-192x192.png",
          tag: "slnews-settings",
        });
      } catch {
        // Fallback for environments where constructor throws
      }

      setter(true);
      toast(`${label} notifications enabled`, "success");
    } else {
      setter(false);
    }
  };

  const statusLabel = permission === "granted"
    ? "Notifications allowed on this device"
    : permission === "denied"
    ? "Notifications blocked in browser settings"
    : permission === "unsupported"
    ? "Using in-app notification inbox"
    : "Tap a toggle to enable notifications";

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
          Notifications & Alerts
        </h3>
        <Link
          href="/notifications"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          View Inbox <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap bg-surface-container p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${
            permission === "granted" ? "bg-green-500 animate-pulse" : permission === "denied" ? "bg-red-500" : "bg-amber-400"
          }`} />
          <span className="text-xs text-on-surface-variant font-medium">{statusLabel}</span>
        </div>

        <button
          type="button"
          onClick={handleSendTestNotification}
          disabled={testing}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-container-highest hover:bg-primary/10 hover:text-primary text-on-surface transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">send</span>
          {testing ? "Sending..." : "Test Alert"}
        </button>
      </div>

      <div className="space-y-1">
        {toggles.map(({ key, label, desc, checked, setter }) => (
          <div key={key} className="flex items-center justify-between py-3.5 px-4 rounded-xl hover:bg-surface-container transition-colors">
            <div>
              <p className="font-semibold text-on-surface text-sm">{label}</p>
              <p className="text-sm text-on-surface-variant mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => handleToggle(!checked, setter, label)}
              role="switch"
              aria-checked={checked}
              aria-label={`${label}: ${checked ? "on" : "off"}`}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${checked ? "bg-primary" : "bg-surface-variant"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
