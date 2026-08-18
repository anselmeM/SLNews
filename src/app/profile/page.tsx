"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AppearanceSection from "./_components/AppearanceSection";
import DataSaverSection from "./_components/DataSaverSection";
import FollowedTopics from "./_components/FollowedTopics";
import NotificationToggles from "./_components/NotificationToggles";
import ProfileCard from "./_components/ProfileCard";
import { loadPreferences, savePreferences, setDailyBriefing } from "@/app/actions/user-actions";
import { useToast } from "@/components/Toast";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { invalidate } from "@/lib/cache";
import { useAppStore } from "@/store/useAppStore";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { promptInstall, isStandalone } = usePWAInstall();
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const dataSaver = useAppStore((s) => s.dataSaver);
  const setDataSaver = useAppStore((s) => s.setDataSaver);
  const preferredTopics = useAppStore((s) => s.preferredTopics);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const breakingNews = useAppStore((s) => s.breakingNews);
  const setBreakingNews = useAppStore((s) => s.setBreakingNews);
  const localAlerts = useAppStore((s) => s.localAlerts);
  const setLocalAlerts = useAppStore((s) => s.setLocalAlerts);
  const [bio, setBio] = useState<string | null>(null);
  const [dailyBriefing, setDailyBriefingState] = useState(false);

  useEffect(() => {
    loadPreferences()
      .then((prefs) => {
        setBio(prefs.bio);
        setDailyBriefingState(prefs.dailyBriefing);
        if (prefs.preferredTopics.length > 0) {
          setPreferences(null, prefs.preferredTopics);
        }
      })
      .catch(() => toast("Could not load preferences", "error"));
  }, [toast]);

  const handleDailyBriefing = async (v: boolean) => {
    setDailyBriefingState(v);
    const result = await setDailyBriefing(v);
    if (!result.success) {
      setDailyBriefingState(!v);
      toast("Could not update briefing setting", "error");
    }
  };

  const notificationToggles = [
    { key: "breakingNews", label: "Breaking News", desc: "Major national headlines instantly.", checked: breakingNews, setter: setBreakingNews },
    { key: "localAlerts", label: "Local Alerts", desc: "Updates from your followed topics.", checked: localAlerts, setter: setLocalAlerts },
    { key: "dailyBriefing", label: "Morning Briefing", desc: "A daily digest of top stories each morning.", checked: dailyBriefing, setter: handleDailyBriefing },
  ];

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
          <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/20 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">newspaper</span>
                <h3 className="text-base font-bold text-on-surface">Daily Morning Briefing</h3>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Read or listen to your curated Sierra Leone news digest anytime.
              </p>
            </div>
            <Link
              href="/digest"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer min-h-[38px]"
            >
              Open Briefing <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </section>

          <DataSaverSection dataSaver={dataSaver} setDataSaver={setDataSaver} />
          <AppearanceSection theme={theme} setTheme={(v) => setTheme(v)} />
          <NotificationToggles toggles={notificationToggles} />
          <FollowedTopics
            topics={preferredTopics}
            onClear={async () => {
              const prevTopics = preferredTopics;
              setPreferences(null, []);
              try {
                await savePreferences(null, []);
                toast("Preferences cleared", "info");
              } catch {
                setPreferences(null, prevTopics);
                toast("Could not clear preferences", "error");
              }
            }}
          />

          <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isStandalone ? "check_circle" : "install_mobile"}
                  </span>
                  {isStandalone ? "App Installed" : "Download & Install App"}
                </h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  {isStandalone
                    ? "SLNews is installed on this device with offline access enabled."
                    : "Install SLNews directly on your home screen for quick offline access and breaking alerts."}
                </p>
              </div>

              {!isStandalone && (
                <button
                  onClick={promptInstall}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/95 shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Install on Device
                </button>
              )}
            </div>
          </section>

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
