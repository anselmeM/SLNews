"use client";

import { useAppStore } from "@/store/useAppStore";

export default function DataSaverGuard({
  children,
  className,
  iconSize = "text-2xl",
}: {
  children: React.ReactNode;
  className?: string;
  iconSize?: string;
}) {
  const dataSaver = useAppStore((s) => s.dataSaver);

  if (!dataSaver) return <>{children}</>;

  return (
    <div
      className={`bg-surface-container flex items-center justify-center ${className || ""}`}
    >
      <span className={`material-symbols-outlined text-outline-variant ${iconSize}`}>
        data_saver_on
      </span>
    </div>
  );
}
