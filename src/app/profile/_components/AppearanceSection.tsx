"use client";

import { useToast } from "@/components/Toast";

export default function AppearanceSection({
  theme,
  setTheme,
}: {
  theme: string;
  setTheme: (v: "light" | "dark" | "system") => void;
}) {
  const { toast } = useToast();

  const handleSetTheme = (key: "light" | "dark" | "system") => {
    setTheme(key);
    const labels: Record<string, string> = {
      light: "Light mode activated",
      dark: "Dark mode activated",
      system: "Using system appearance",
    };
    toast(labels[key] ?? "Theme updated", "success");
  };

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm">
      <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
        Appearance
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "light", icon: "light_mode", label: "Light" },
          { key: "dark", icon: "dark_mode", label: "Dark" },
          { key: "system", icon: "settings_suggest", label: "System" },
        ].map(({ key, icon, label }) => {
          const active = theme === key;
          return (
            <button
              key={key}
              onClick={() => handleSetTheme(key as "light" | "dark" | "system")}
              className={`relative flex flex-col items-center gap-2.5 py-5 px-4 rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] ${
                active
                  ? "bg-primary/10 dark:bg-primary/20 border-2 border-primary shadow-sm"
                  : "bg-surface-container border-2 border-transparent hover:bg-surface-container-high hover:border-outline-variant"
              }`}
            >
              {active && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </span>
              )}
              <span
                className={`material-symbols-outlined text-[32px] ${
                  active ? "text-primary" : "text-on-surface-variant"
                }`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {icon}
              </span>
              <span
                className={`text-sm font-semibold ${
                  active ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
