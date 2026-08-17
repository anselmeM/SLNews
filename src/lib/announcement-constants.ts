export const ANNOUNCEMENT_CATEGORIES = [
  "All",
  "Jobs",
  "Real Estate",
  "Public Notices",
  "Events",
  "Government",
  "NGO Announcement",
  "Local Event",
  "Death Notice",
] as const;

export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number];

export const CATEGORY_ICON_MAP: Record<string, string> = {
  "Jobs": "work",
  "Real Estate": "home",
  "Public Notices": "campaign",
  "Events": "event",
  "Government": "account_balance",
  "NGO Announcement": "volunteer_activism",
  "Local Event": "celebration",
  "Death Notice": "church",
};
