import type { Metadata } from "next";
import Link from "next/link";
import PostNoticeForm from "./_components/PostNoticeForm";

export const metadata: Metadata = {
  title: "Post a Notice | SLNews",
  description: "Submit a community notice, event, or announcement for Sierra Leone.",
};

export default function PostNoticePage() {
  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      <Link
        href="/announcements"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline mb-6"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Announcements
      </Link>

      <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight mb-2">
        Post a Notice
      </h1>
      <p className="text-sm text-on-surface-variant mb-8">
        Submit a community notice, local event, or public announcement.
      </p>

      <PostNoticeForm />
    </div>
  );
}
