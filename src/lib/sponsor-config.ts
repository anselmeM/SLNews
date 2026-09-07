export type AdSlotId =
  | "article_mid"
  | "article_bottom"
  | "feed_native"
  | "market_fx_sponsor"
  | "announcements_featured";

export type AdSlotFormat = "rectangle" | "horizontal" | "infeed" | "banner";

export interface SponsorCampaign {
  id: string;
  slotId: AdSlotId;
  title: string;
  description: string;
  imageUrl?: string;
  href: string;
  ctaText?: string;
  badge?: string;
  category?: string; // Optional: match specific article category
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
  active: boolean;
}

/**
 * Direct partner campaign registry.
 * Local Sierra Leone partners (banks, telecoms, remittance, tech, FMCG) can be configured here.
 */
export const DIRECT_SPONSOR_CAMPAIGNS: SponsorCampaign[] = [
  {
    id: "sl-remit-sendwave",
    slotId: "market_fx_sponsor",
    title: "Send Money to Sierra Leone with Zero Fee",
    description: "Instant delivery to Orange Money, Afrimoney & local bank accounts at the best daily rates.",
    href: "https://www.sendwave.com",
    ctaText: "Send Money Now",
    badge: "Official FX Partner",
    active: true,
  },
  {
    id: "rokel-digital-banking",
    slotId: "article_mid",
    title: "Rokel SimKorpor — Bank on the Go",
    description: "Open an account, pay bills, and transfer funds nationwide from your mobile phone with Rokel Commercial Bank.",
    href: "https://rokelbank.sl",
    ctaText: "Get Started",
    badge: "Sponsored",
    category: "Economy",
    active: true,
  },
  {
    id: "orange-data-bundles",
    slotId: "article_bottom",
    title: "Stay Connected Across Sierra Leone",
    description: "Get lightning-fast 4G+ data bundles and seamless streaming with Orange Sierra Leone.",
    href: "https://www.orange.sl",
    ctaText: "View Bundles",
    badge: "Partner",
    active: true,
  },
  {
    id: "firstmile-dev-mvp",
    slotId: "feed_native",
    title: "Launch Your Digital Product in Sierra Leone & Beyond",
    description: "Rapid mobile apps, fintech integrations, and custom web platforms built for scale by FirstMileDev.",
    href: "https://firstmiledev.ca",
    ctaText: "Learn More",
    badge: "Sponsored",
    active: true,
  },
];

/**
 * Get an active direct campaign for a slot.
 * Matches on date range, slot ID, and optional category match.
 */
export function getActiveSponsorCampaign(
  slotId: AdSlotId,
  category?: string
): SponsorCampaign | null {
  const now = new Date();

  // Find matching active campaigns for this slot
  const matching = DIRECT_SPONSOR_CAMPAIGNS.filter((c) => {
    if (!c.active || c.slotId !== slotId) return false;
    if (c.startDate && new Date(c.startDate) > now) return false;
    if (c.endDate && new Date(c.endDate) < now) return false;
    // If campaign specifies category, prioritize matching it
    if (c.category && category && c.category.toLowerCase() !== category.toLowerCase()) {
      return false;
    }
    return true;
  });

  if (matching.length === 0) {
    // If no category-specific match, check if there is a slot match without category constraint
    const generic = DIRECT_SPONSOR_CAMPAIGNS.find((c) => {
      if (!c.active || c.slotId !== slotId || c.category) return false;
      if (c.startDate && new Date(c.startDate) > now) return false;
      if (c.endDate && new Date(c.endDate) < now) return false;
      return true;
    });
    return generic || null;
  }

  // If multiple matching, pick randomly or the first one
  return matching[Math.floor(Math.random() * matching.length)] || null;
}
