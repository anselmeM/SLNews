import ComingSoonButton from "@/components/ComingSoonButton";

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
  return (
    <article className="bg-surface-container-lowest rounded-xl p-4 md:p-6 shadow-[0_4px_12px_rgba(27,28,28,0.08)] border border-outline/5 flex flex-col gap-3 relative overflow-hidden group hover:shadow-[0_8px_16px_rgba(27,28,28,0.12)] transition-shadow duration-300">
      <div className={`absolute top-0 left-0 w-1 h-full ${urgencyColor(announcement.urgency)}`} />
      <div className="flex justify-between items-start">
          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-[14px]">{announcement.icon}</span>
          {announcement.category}
        </span>
        <span className="font-label-sm text-label-sm text-on-surface-variant">{announcement.dateLabel}</span>
      </div>
      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1 group-hover:text-primary transition-colors">{announcement.title}</h2>
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
      <div className="mt-auto pt-4 border-t border-outline/10 flex justify-end">
        <ComingSoonButton message="Full notice view coming soon!" className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1 cursor-pointer">
          Read Full Notice <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </ComingSoonButton>
      </div>
    </article>
  );
}
