"use client";

import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useEffect, useRef } from "react";
import BottomNavBar from "./BottomNavBar";
import MotionProvider from "./MotionProvider";
import TopAppBar from "./TopAppBar";
import { getSavedArticleIds, loadPreferences } from "@/app/actions/user-actions";
import AudioPlayerBar from "@/components/AudioPlayerBar";
import BackToTop from "@/components/BackToTop";
import InstallBanner from "@/components/InstallBanner";
import NetworkStatusBar from "@/components/NetworkStatusBar";
import ThemeSync from "@/components/ThemeSync";
import { ToastProvider } from "@/components/Toast";
import { useAppStore } from "@/store/useAppStore";

export default function AppLayoutWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const pathname = usePathname();
  const setSavedIds = useAppStore((s) => s.setSavedIds);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const syncedRef = useRef(false);

  useEffect(() => {
    // Rehydrate persisted preferences after mount so the client's first
    // render matches SSR defaults (see useAppStore skipHydration).
    useAppStore.persist?.rehydrate();

    if (session?.user?.id && !syncedRef.current) {
      syncedRef.current = true;
      Promise.all([getSavedArticleIds(), loadPreferences()]).then(
        ([ids, prefs]) => {
          setSavedIds(ids);
          setPreferences(null, prefs.preferredTopics);
        }
      ).catch(() => {});
    }
    if (!session?.user?.id) {
      syncedRef.current = false;
    }
  }, [session?.user?.id, setSavedIds, setPreferences]);

  const isAuthPage = pathname === "/login";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <MotionProvider>
    <SessionProvider session={session}>
    <ToastProvider>
      <ThemeSync />
      <div className="pt-[80px] pb-[100px] md:pb-16 min-h-screen bg-surface">
        <NetworkStatusBar />
        <TopAppBar session={session} />
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {children}
        </main>
        <BottomNavBar />
        <AudioPlayerBar />
        <BackToTop />
        <InstallBanner />
      </div>
    </ToastProvider>
    </SessionProvider>
    </MotionProvider>
  );
}
