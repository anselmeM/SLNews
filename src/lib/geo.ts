/**
 * Sierra Leone's provinces and districts, in one place.
 *
 * This list used to exist four times over, and the copies disagreed: the
 * dashboard editor wrote `"Southern"`, the seed and the search filter offered
 * `"Southern Province"`, `SL_PROVINCES` held a third set (unused), and the
 * announcements filter a fourth (no North West). Because the filter matched
 * `province` exactly, a reader who picked a province got an empty page unless
 * the stored spelling happened to equal the option — which is the worst kind of
 * broken, since it looks like "there is no news from there".
 *
 * The canonical form is the one the public UI already shows and the seed already
 * writes: the full `"… Province"` names. Everything else is an alias, so rows
 * written by the old dashboard keep working without a data migration.
 */

export type SlProvince =
  | "Western Area"
  | "Northern Province"
  | "North West Province"
  | "Southern Province"
  | "Eastern Province";

/** Canonical spellings, in the order the UI should present them. */
export const SL_PROVINCES: readonly SlProvince[] = [
  "Western Area",
  "Northern Province",
  "North West Province",
  "Southern Province",
  "Eastern Province",
];

type ProvinceDefinition = {
  canonical: SlProvince;
  /** Other spellings that have shipped, in the UI or in stored rows. */
  aliases: readonly string[];
  districts: readonly string[];
};

const PROVINCES: readonly ProvinceDefinition[] = [
  {
    canonical: "Western Area",
    aliases: ["Western"],
    districts: ["Western Area Urban", "Western Area Rural", "Freetown"],
  },
  {
    canonical: "Northern Province",
    aliases: ["Northern"],
    districts: ["Bombali", "Falaba", "Koinadugu", "Tonkolili"],
  },
  {
    canonical: "North West Province",
    aliases: ["North West", "North-West", "Northwest", "Northwest Province"],
    districts: ["Kambia", "Karene", "Port Loko"],
  },
  {
    canonical: "Southern Province",
    aliases: ["Southern"],
    districts: ["Bo", "Bonthe", "Moyamba", "Pujehun"],
  },
  {
    canonical: "Eastern Province",
    aliases: ["Eastern"],
    districts: ["Kailahun", "Kenema", "Kono"],
  },
];

const PROVINCE_LOOKUP = new Map<string, SlProvince>();
const DISTRICT_LOOKUP = new Map<string, SlProvince>();

for (const province of PROVINCES) {
  PROVINCE_LOOKUP.set(province.canonical.toLowerCase(), province.canonical);
  for (const alias of province.aliases) {
    PROVINCE_LOOKUP.set(alias.toLowerCase(), province.canonical);
  }
  for (const district of province.districts) {
    DISTRICT_LOOKUP.set(district.toLowerCase(), province.canonical);
  }
}

function key(raw: string | null | undefined): string {
  return (raw ?? "").trim().toLowerCase();
}

/**
 * Canonical spelling for a province value, or `null` when it is not one. Used
 * on write, so the stored vocabulary cannot drift again.
 */
export function normalizeProvince(raw: string | null | undefined): SlProvince | null {
  return PROVINCE_LOOKUP.get(key(raw)) ?? null;
}

/** The province a district belongs to, or `null` when it is not a district. */
export function districtProvince(raw: string | null | undefined): SlProvince | null {
  return DISTRICT_LOOKUP.get(key(raw)) ?? null;
}

/**
 * What a province filter should match on, or `null` when the value is not a
 * province (in which case the caller must not filter, rather than filter on an
 * impossible value and return nothing).
 *
 * Districts are included because `mapPrismaArticle` presents `district ||
 * province` as a story's location: a story tagged only with the district "Bo" is
 * a Southern Province story as far as the reader is concerned, even though its
 * `province` column is empty.
 */
export function provinceMatchTerms(raw: string | null | undefined): {
  provinces: string[];
  districts: string[];
} | null {
  const canonical = normalizeProvince(raw) ?? districtProvince(raw);
  if (!canonical) return null;

  const definition = PROVINCES.find((entry) => entry.canonical === canonical);
  if (!definition) return null;

  // Canonical first, then every legacy spelling that may already be stored.
  return {
    provinces: [...new Set([definition.canonical, ...definition.aliases])],
    districts: [...definition.districts],
  };
}
