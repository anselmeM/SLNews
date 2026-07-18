"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

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
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(getPermissionStatus);

  const handleToggle = async (checked: boolean, setter: (v: boolean) => void, label: string) => {
    if (checked) {
      if (permission === "unsupported") {
        toast("Notifications are not supported in this browser.", "error");
        return;
      }
      if (permission === "denied") {
        toast("Notifications are blocked. Enable them in your browser settings.", "error");
        return;
      }
      if (permission === "default") {
        try {
          const result = await Notification.requestPermission();
          setPermission(result);
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

      new Notification("SLNews Alerts", {
        body: `You'll now receive ${label.toLowerCase()} notifications.`,
        icon: "/icon-192x192.png",
        tag: "slnews-settings",
      });

      setter(true);
      toast(`${label} notifications enabled`, "success");
    } else {
      setter(false);
    }
  };

  const statusLabel = permission === "granted"
    ? "Notifications allowed"
    : permission === "denied"
    ? "Notifications blocked in browser settings"
    : permission === "unsupported"
    ? "Notifications not supported in this browser"
    : "Tap a toggle to enable notifications";

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm">
      <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
        Notifications
      </h3>

      <div className="mb-3 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${
          permission === "granted" ? "bg-green-500" : permission === "denied" ? "bg-red-500" : "bg-gray-400"
        }`} />
        <span className="text-xs text-on-surface-variant">{statusLabel}</span>
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
