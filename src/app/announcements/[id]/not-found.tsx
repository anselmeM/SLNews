import Link from "next/link";

export default function NoticeNotFound() {
  return (
    <div className="w-full max-w-3xl mx-auto py-16 px-4 text-center">
      <span className="material-symbols-outlined text-5xl mb-4 opacity-50 text-on-surface-variant">campaign</span>
      <h2 className="text-xl font-bold text-on-surface mb-2">Notice Not Found</h2>
      <p className="text-sm text-on-surface-variant mb-6">
        This announcement doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/announcements"
        className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:underline"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Announcements
      </Link>
    </div>
  );
}
