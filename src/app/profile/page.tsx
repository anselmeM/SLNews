"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AppearanceSection from "./_components/AppearanceSection";
import DataSaverSection from "./_components/DataSaverSection";
import FollowedRegions from "./_components/FollowedRegions";
import NotificationToggles from "./_components/NotificationToggles";
import ProfileCard from "./_components/ProfileCard";
import { loadPreferences } from "@/app/actions/user-actions";
import { useToast } from "@/components/Toast";
import { invalidate } from "@/lib/cache";

import { useAppStore } from "@/store/useAppStore";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const dataSaver = useAppStore((s) => s.dataSaver);
  const setDataSaver = useAppStore((s) => s.setDataSaver);
  const preferredRegion = useAppStore((s) => s.preferredRegion);
  const preferredTopics = useAppStore((s) => s.preferredTopics);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const breakingNews = useAppStore((s) => s.breakingNews);
  const setBreakingNews = useAppStore((s) => s.setBreakingNews);
  const localAlerts = useAppStore((s) => s.localAlerts);
  const setLocalAlerts = useAppStore((s) => s.setLocalAlerts);
  const [bio, setBio] = useState<string | null>(null);

  useEffect(() => { loadPreferences().then((prefs) => {
    setBio(prefs.bio);
    if (prefs.preferredRegion || prefs.preferredTopics.length > 0) {
      setPreferences(prefs.preferredRegion, prefs.preferredTopics);
    }
  }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const notificationToggles = [
    { key: "breakingNews", label: "Breaking News", desc: "Major national headlines instantly.", checked: breakingNews, setter: setBreakingNews },
    { key: "localAlerts", label: "Local Alerts", desc: "Updates from followed regions.", checked: localAlerts, setter: setLocalAlerts },
  ];

          <FollowedRegions
            region={preferredRegion}
            topics={preferredTopics}
            onClear={() => setPreferences(null, [])}
          />

  const handleClearCache = () => {
    invalidate();
    toast("Cache cleared! Fresh content will load on next visit.", "success");
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Settings</h1>
        <p className="text-on-surface-variant mt-1">Manage your reading experience and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-4">
          <ProfileCard
            name={session?.user?.name}
            email={session?.user?.email}
            image={session?.user?.image}
            bio={bio}
          />
        </section>

        <div className="lg:col-span-8 space-y-6">
          <DataSaverSection dataSaver={dataSaver} setDataSaver={setDataSaver} />
          <AppearanceSection theme={theme} setTheme={(v) => setTheme(v)} />
          <NotificationToggles toggles={notificationToggles} />
          <FollowedRegions
            region={preferredRegion}
            topics={preferredTopics}
            onClear={() => setPreferences(null, [])}
          />

          <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm">
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>cached</span>
              Data &amp; Storage
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Clear cached news feeds and market data to force a fresh refresh from the server.
            </p>
            <button
              onClick={handleClearCache}
              className="px-5 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-colors border border-outline-variant cursor-pointer min-h-[44px]"
            >
              Clear Cache
            </button>
          </section>

          <div className="pt-2 pb-8">
            <button onClick={() => signOut()} className="w-full sm:w-auto px-8 py-3 rounded-xl border border-error/20 text-error hover:bg-error-container hover:text-on-error-container font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
