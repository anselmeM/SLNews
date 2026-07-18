import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found | SLNews",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center px-6 py-16 max-w-md mx-auto">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-primary">search_off</span>
        </div>
        <h1 className="text-6xl font-black text-on-surface tracking-tighter mb-2">404</h1>
        <p className="text-lg font-semibold text-on-surface mb-1">Page not found</p>
        <p className="text-sm text-on-surface-variant mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-md hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
