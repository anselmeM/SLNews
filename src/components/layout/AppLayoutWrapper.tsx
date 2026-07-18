"use client";

import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useEffect, useRef } from "react";
import BottomNavBar from "./BottomNavBar";
import TopAppBar from "./TopAppBar";
import { getSavedArticleIds, loadPreferences } from "@/app/actions/user-actions";
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
    if (session?.user?.id && !syncedRef.current) {
      syncedRef.current = true;
      Promise.all([getSavedArticleIds(), loadPreferences()]).then(
        ([ids, prefs]) => {
          setSavedIds(ids);
          setPreferences(prefs.preferredRegion, prefs.preferredTopics);
        }
      );
    }
    if (!session?.user?.id) {
      syncedRef.current = false;
    }
  }, [session?.user?.id, setSavedIds, setPreferences]);

  const isAuthOrOnboarding = pathname === "/" || pathname === "/login";

  if (isAuthOrOnboarding) {
    return <>{children}</>;
  }

  return (
    <SessionProvider session={session}>
    <ToastProvider>
      <div className="pt-[80px] pb-[100px] md:pb-16 min-h-screen bg-surface">
        <TopAppBar session={session} />
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {children}
        </main>
        <BottomNavBar />
      </div>
    </ToastProvider>
    </SessionProvider>
  );
}
