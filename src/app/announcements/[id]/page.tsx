import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AnnouncementComments from "./_components/AnnouncementComments";
import { extractContactPhone, getWhatsAppUrl, getTelUrl } from "@/lib/contact-utils";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const notice = await db.announcement.findUnique({ where: { id } });
  if (!notice) return { title: "Notice Not Found | SLNews" };
  return {
    title: `${notice.title} | SLNews Announcements`,
    description: notice.body.slice(0, 160),
  };
}

export default async function NoticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let notice;
  try {
    notice = await db.announcement.findUnique({ where: { id } });
  } catch {
    notFound();
  }

  if (!notice) notFound();

  const contactPhone = extractContactPhone(notice.body);
  const waUrl = getWhatsAppUrl(contactPhone, `Hello, regarding your notice "${notice.title}" on SLNews:`);
  const telUrl = getTelUrl(contactPhone);

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <Link
        href="/announcements"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline mb-6"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Announcements
      </Link>

      <article>
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">{notice.icon}</span>
            {notice.category}
          </span>
          <span className="text-xs text-on-surface-variant">{notice.dateLabel}</span>
          {notice.urgency === "urgent" && (
            <span className="inline-flex items-center gap-1 bg-error/10 text-error px-3 py-1 rounded-full text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">priority_high</span>
              Urgent
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight mb-4">
          {notice.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant mb-6">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            {notice.organization}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {notice.location}
          </span>
        </div>

        {/* Contact Action Bar */}
        {contactPhone && (
          <div className="bg-surface-container-low border border-outline/20 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Contact Lister</p>
              <p className="text-sm font-semibold text-on-surface">{contactPhone}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>WhatsApp</span>
                </a>
              )}
              {telUrl && (
                <a
                  href={telUrl}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary hover:bg-primary/90 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  <span>Call</span>
                </a>
              )}
            </div>
          </div>
        )}

        <div className="prose prose-sm md:prose-base max-w-none text-on-surface/90 leading-relaxed whitespace-pre-line bg-surface-container-lowest p-6 rounded-2xl border border-outline/10 mb-8">
          {notice.body}
        </div>
      </article>

      <AnnouncementComments announcementId={notice.id} />
    </div>
  );
}
