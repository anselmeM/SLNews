import Link from "next/link";
import { extractContactPhone, getWhatsAppUrl, getTelUrl } from "@/lib/contact-utils";

function urgencyColor(urgency: string | null) {
  switch (urgency) {
    case "urgent": return "bg-error";
    case "warning": return "bg-secondary";
    default: return "bg-primary";
  }
}

export type Announcement = {
  id: string; title: string; body: string; category: string; icon: string; organization: string; location: string; dateLabel: string; urgency: string | null;
};

export default function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const contactPhone = extractContactPhone(announcement.body);
  const waUrl = getWhatsAppUrl(contactPhone, `Hello, regarding "${announcement.title}" on SLNews:`);
  const telUrl = getTelUrl(contactPhone);

  return (
    <article className="bg-surface-container-lowest rounded-xl p-4 md:p-6 shadow-[0_4px_12px_rgba(27,28,28,0.08)] border border-outline/5 flex flex-col gap-3 relative overflow-hidden group hover:shadow-[0_8px_16px_rgba(27,28,28,0.12)] transition-shadow duration-300">
      <div className={`absolute top-0 left-0 w-1 h-full ${urgencyColor(announcement.urgency)}`} />
      <div className="flex justify-between items-start">
        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-label-sm text-xs font-semibold">
          <span className="material-symbols-outlined text-[14px]">{announcement.icon}</span>
          {announcement.category}
        </span>
        <span className="font-label-sm text-xs text-on-surface-variant">{announcement.dateLabel}</span>
      </div>
      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">
          <Link
            href={`/announcements/${announcement.id}`}
            className="group-hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline focus-visible:text-primary"
          >
            {announcement.title}
          </Link>
        </h2>
        <p className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">account_balance</span>
          {announcement.organization}
        </p>
      </div>
      <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant mt-1">
        <span className="material-symbols-outlined text-[16px]">location_on</span>
        {announcement.location}
      </div>
      <p className="font-body-md text-body-md text-on-surface/80 line-clamp-3 mt-2">{announcement.body}</p>
      
      <div className="mt-auto pt-4 border-t border-outline/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
              aria-label="Contact on WhatsApp"
            >
              <span className="material-symbols-outlined text-[15px]">chat</span>
              <span>WhatsApp</span>
            </a>
          )}
          {telUrl && (
            <a
              href={telUrl}
              className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant hover:bg-surface-container-high px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
              aria-label="Call contact"
            >
              <span className="material-symbols-outlined text-[15px]">call</span>
              <span>Call</span>
            </a>
          )}
        </div>
        <Link
          href={`/announcements/${announcement.id}`}
          className="inline-flex items-center gap-1 text-primary font-label-md text-label-md hover:underline font-semibold ml-auto"
        >
          Read Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
}
