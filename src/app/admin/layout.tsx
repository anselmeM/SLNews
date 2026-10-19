import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SLNews admin",
  robots: { index: false, follow: false },
};

/** Admin surface: no public chrome, noindex, minimal styling. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-sm">
      <header className="mb-6 flex items-center justify-between border-b border-outline-variant/30 pb-3">
        <span className="text-lg font-black">SLNews admin</span>
        <Link
          className="text-xs text-on-surface-variant hover:text-on-surface"
          href="/"
        >
          Public site
        </Link>
      </header>
      {children}
    </div>
  );
}
