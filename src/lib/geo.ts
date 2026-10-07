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
 * writes: the full `"… Province"` names and the official district names.
 * Everything else that has ever been written is an alias, so rows already in the
 * database keep working without a data migration.
 */

export type SlProvince =
  | "Western Area"
  | "Northern Province"
  | "North West Province"
  | "Southern Province"
  | "Eastern Province";

export type SlDistrict =
  | "Western Area Urban"
  | "Western Area Rural"
  | "Bombali"
  | "Falaba"
  | "Koinadugu"
  | "Tonkolili"
  | "Kambia"
  | "Karene"
  | "Port Loko"
  | "Bo"
  | "Bonthe"
  | "Moyamba"
  | "Pujehun"
  | "Kailahun"
  | "Kenema"
  | "Kono";

/** Canonical spellings, in the order the UI should present them. */
export const SL_PROVINCES: readonly SlProvince[] = [
  "Western Area",
  "Northern Province",
  "North West Province",
  "Southern Province",
  "Eastern Province",
];

/** Sierra Leone's 16 districts, by province. */
export const SL_DISTRICTS_BY_PROVINCE: Record<SlProvince, readonly SlDistrict[]> = {
  "Western Area": ["Western Area Urban", "Western Area Rural"],
  "Northern Province": ["Bombali", "Falaba", "Koinadugu", "Tonkolili"],
  "North West Province": ["Kambia", "Karene", "Port Loko"],
  "Southern Province": ["Bo", "Bonthe", "Moyamba", "Pujehun"],
  "Eastern Province": ["Kailahun", "Kenema", "Kono"],
};

/** Every district, in province order. */
export const SL_DISTRICTS: readonly SlDistrict[] = SL_PROVINCES.flatMap(
  (province) => SL_DISTRICTS_BY_PROVINCE[province]
);

/** Other province spellings that have shipped, in the UI or in stored rows. */
const PROVINCE_ALIASES: readonly { canonical: SlProvince; aliases: readonly string[] }[] = [
  { canonical: "Western Area", aliases: ["Western"] },
  { canonical: "Northern Province", aliases: ["Northern"] },
  {
    canonical: "North West Province",
    aliases: ["North West", "North-West", "Northwest", "Northwest Province"],
  },
  { canonical: "Southern Province", aliases: ["Southern"] },
  { canonical: "Eastern Province", aliases: ["Eastern"] },
];

/**
 * Other district spellings that have shipped. `SubmitReelModal` offered city
 * names with the district in brackets, then wrote that label straight into the
 * article's `district` *and* `province` columns, so both columns hold strings
 * like `"Makeni (Bombali)"` today.
 */
const DISTRICT_ALIASES: readonly { canonical: SlDistrict; aliases: readonly string[] }[] = [
  {
    canonical: "Western Area Urban",
    aliases: ["Freetown", "Freetown (Western Urban)", "Western Urban"],
  },
  { canonical: "Western Area Rural", aliases: ["Western Rural"] },
  { canonical: "Bombali", aliases: ["Makeni", "Makeni (Bombali)"] },
];

const PROVINCE_BY_ALIAS = new Map<string, SlProvince>();
const DISTRICT_BY_ALIAS = new Map<string, SlDistrict>();
const PROVINCE_BY_DISTRICT = new Map<SlDistrict, SlProvince>();

for (const province of SL_PROVINCES) {
  PROVINCE_BY_ALIAS.set(province.toLowerCase(), province);
  for (const district of SL_DISTRICTS_BY_PROVINCE[province]) {
    DISTRICT_BY_ALIAS.set(district.toLowerCase(), district);
    PROVINCE_BY_DISTRICT.set(district, province);
  }
}
for (const { canonical, aliases } of PROVINCE_ALIASES) {
  for (const alias of aliases) PROVINCE_BY_ALIAS.set(alias.toLowerCase(), canonical);
}
for (const { canonical, aliases } of DISTRICT_ALIASES) {
  for (const alias of aliases) DISTRICT_BY_ALIAS.set(alias.toLowerCase(), canonical);
}

function key(raw: string | null | undefined): string {
  return (raw ?? "").trim().toLowerCase();
}

/**
 * Canonical spelling for a province value, or `null` when it is not one. Used
 * on write, so the stored vocabulary cannot drift again.
 */
export function normalizeProvince(raw: string | null | undefined): SlProvince | null {
  return PROVINCE_BY_ALIAS.get(key(raw)) ?? null;
}

/** Canonical spelling for a district value, or `null` when it is not one. */
export function normalizeDistrict(raw: string | null | undefined): SlDistrict | null {
  return DISTRICT_BY_ALIAS.get(key(raw)) ?? null;
}

/** The province a district spelling belongs to, or `null` if it is not one. */
export function districtProvince(raw: string | null | undefined): SlProvince | null {
  const district = normalizeDistrict(raw);
  return district ? PROVINCE_BY_DISTRICT.get(district) ?? null : null;
}

/**
 * Splits one location value into the two columns that should hold it.
 *
 * A value that is neither a province nor a district is kept as-is in `district`
 * rather than being forced into `province`: the location is still shown to
 * readers (`mapPrismaArticle` uses `district || province`), and an unrecognised
 * string in the province column is exactly what made the province filter
 * unusable in the first place.
 */
export function splitLocation(raw: string | null | undefined): {
  province: SlProvince | null;
  district: string | null;
} {
  const province = normalizeProvince(raw);
  if (province) return { province, district: null };

  const district = normalizeDistrict(raw);
  if (district) {
    return { province: PROVINCE_BY_DISTRICT.get(district) ?? null, district };
  }

  const trimmed = (raw ?? "").trim();
  return { province: null, district: trimmed.length > 0 ? trimmed : null };
}

/**
 * What a province filter should match on, or `null` when the value is not a
 * province (in which case the caller must not filter, rather than filter on an
 * impossible value and return nothing).
 *
 * Districts are included — with their old spellings — because
 * `mapPrismaArticle` presents `district || province` as a story's location: a
 * story tagged only with the district "Bo", or with the reel form's
 * "Makeni (Bombali)", is a story from that province as far as the reader is
 * concerned, even though its `province` column is empty.
 */
export function provinceMatchTerms(raw: string | null | undefined): {
  provinces: string[];
  districts: string[];
} | null {
  const canonical = normalizeProvince(raw) ?? districtProvince(raw);
  if (!canonical) return null;

  const provinceAliases =
    PROVINCE_ALIASES.find((entry) => entry.canonical === canonical)?.aliases ?? [];
  const districtAliases = DISTRICT_ALIASES.filter(
    (entry) => PROVINCE_BY_DISTRICT.get(entry.canonical) === canonical
  ).flatMap((entry) => entry.aliases);

  return {
    // Canonical first, then every legacy spelling that may already be stored.
    provinces: [...new Set([canonical, ...provinceAliases])],
    districts: [
      ...new Set([...SL_DISTRICTS_BY_PROVINCE[canonical], ...districtAliases]),
    ],
  };
}
