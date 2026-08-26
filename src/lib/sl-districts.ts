export interface DistrictInfo {
  id: string;
  name: string;
  province: string;
  headquarters: string;
  staples: string[];
  description: string;
  coordinates: { x: number; y: number }; // Relative SVG positioning
}

export interface ProvinceInfo {
  id: string;
  name: string;
  shortName: string;
  color: string;
  accentClass: string;
  bgClass: string;
  borderClass: string;
  districts: string[];
}

export const SL_PROVINCES: ProvinceInfo[] = [
  {
    id: "western",
    name: "Western Area",
    shortName: "Western",
    color: "#059669", // emerald
    accentClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20",
    borderClass: "border-emerald-500/30",
    districts: ["Western Area Urban", "Western Area Rural"],
  },
  {
    id: "northern",
    name: "Northern Province",
    shortName: "Northern",
    color: "#d97706", // amber
    accentClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/20",
    borderClass: "border-amber-500/30",
    districts: ["Bombali", "Tonkolili", "Koinadugu", "Falaba"],
  },
  {
    id: "north-west",
    name: "North-West Province",
    shortName: "North-West",
    color: "#0284c7", // sky
    accentClass: "text-sky-600 dark:text-sky-400",
    bgClass: "bg-sky-500/10 dark:bg-sky-500/20",
    borderClass: "border-sky-500/30",
    districts: ["Port Loko", "Kambia", "Karene"],
  },
  {
    id: "southern",
    name: "Southern Province",
    shortName: "Southern",
    color: "#4f46e5", // indigo
    accentClass: "text-indigo-600 dark:text-indigo-400",
    bgClass: "bg-indigo-500/10 dark:bg-indigo-500/20",
    borderClass: "border-indigo-500/30",
    districts: ["Bo", "Bonthe", "Moyamba", "Pujehun"],
  },
  {
    id: "eastern",
    name: "Eastern Province",
    shortName: "Eastern",
    color: "#9333ea", // purple
    accentClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-500/10 dark:bg-purple-500/20",
    borderClass: "border-purple-500/30",
    districts: ["Kenema", "Kono", "Kailahun"],
  },
];

export const SL_DISTRICTS: DistrictInfo[] = [
  // Western Area
  {
    id: "western-urban",
    name: "Western Area Urban",
    province: "Western Area",
    headquarters: "Freetown",
    staples: ["Commerce", "Fish", "Imports", "Fuel"],
    description: "National capital, major maritime port, and financial engine of Sierra Leone.",
    coordinates: { x: 75, y: 195 },
  },
  {
    id: "western-rural",
    name: "Western Area Rural",
    province: "Western Area",
    headquarters: "Waterloo",
    staples: ["Cassava", "Fish", "Tourism", "Vegetables"],
    description: "Coastal peninsula comprising Waterloo, Regent, Kent, and Goderich.",
    coordinates: { x: 95, y: 220 },
  },

  // North-West Province
  {
    id: "kambia",
    name: "Kambia",
    province: "North-West Province",
    headquarters: "Kambia",
    staples: ["Rice", "Cross-border Trade", "Groundnuts"],
    description: "Border district with Guinea; renowned for expansive riverine rice cultivation.",
    coordinates: { x: 90, y: 110 },
  },
  {
    id: "port-loko",
    name: "Port Loko",
    province: "North-West Province",
    headquarters: "Port Loko",
    staples: ["Bauxite", "Fish", "Cassava", "Palm Oil"],
    description: "Home to Freetown International Airport (Lungi) and major transit corridors.",
    coordinates: { x: 130, y: 165 },
  },
  {
    id: "karene",
    name: "Karene",
    province: "North-West Province",
    headquarters: "Kamakwie",
    staples: ["Livestock", "Peppers", "Rice", "Cassava"],
    description: "Agricultural heartland along the Little Scarcies river valley.",
    coordinates: { x: 155, y: 95 },
  },

  // Northern Province
  {
    id: "bombali",
    name: "Bombali",
    province: "Northern Province",
    headquarters: "Makeni",
    staples: ["Sugar Cane", "Commercial Trade", "Rice"],
    description: "Major hub of Northern commerce and educational center anchored by Makeni.",
    coordinates: { x: 195, y: 135 },
  },
  {
    id: "tonkolili",
    name: "Tonkolili",
    province: "Northern Province",
    headquarters: "Magburaka",
    staples: ["Iron Ore", "Hydroelectric Energy", "Rice"],
    description: "Geographic center of Sierra Leone; hosts Bumbuna Hydroelectric Plant.",
    coordinates: { x: 235, y: 175 },
  },
  {
    id: "koinadugu",
    name: "Koinadugu",
    province: "Northern Province",
    headquarters: "Kabala",
    staples: ["Vegetables", "Livestock", "Potatoes", "Cabbage"],
    description: "Loma Mountains highland district known for cool climate agriculture and cattle.",
    coordinates: { x: 275, y: 90 },
  },
  {
    id: "falaba",
    name: "Falaba",
    province: "Northern Province",
    headquarters: "Bendugu",
    staples: ["Cattle", "Ginger", "Rice", "Honey"],
    description: "Northeastern frontier district bordering Guinea with vast savanna ranching.",
    coordinates: { x: 335, y: 80 },
  },

  // Eastern Province
  {
    id: "kono",
    name: "Kono",
    province: "Eastern Province",
    headquarters: "Koidu",
    staples: ["Diamonds", "Gold", "Coffee", "Rice"],
    description: "Rich diamond mining district and major Eastern economic power.",
    coordinates: { x: 325, y: 165 },
  },
  {
    id: "kenema",
    name: "Kenema",
    province: "Eastern Province",
    headquarters: "Kenema",
    staples: ["Cocoa", "Timber", "Palm Oil", "Gold"],
    description: "Hub of the Eastern cocoa & coffee belt and gateway to Gola Rainforest.",
    coordinates: { x: 300, y: 245 },
  },
  {
    id: "kailahun",
    name: "Kailahun",
    province: "Eastern Province",
    headquarters: "Kailahun",
    staples: ["Cocoa", "Coffee", "Palm Oil", "Ginger"],
    description: "Border triangle district with Liberia & Guinea; top national cocoa producer.",
    coordinates: { x: 375, y: 225 },
  },

  // Southern Province
  {
    id: "moyamba",
    name: "Moyamba",
    province: "Southern Province",
    headquarters: "Moyamba",
    staples: ["Rutile", "Bauxite", "Palm Oil", "Fish"],
    description: "Major mineral extraction center and sprawling agricultural landscape.",
    coordinates: { x: 155, y: 235 },
  },
  {
    id: "bo",
    name: "Bo",
    province: "Southern Province",
    headquarters: "Bo City",
    staples: ["Commerce", "Education", "Rice", "Gold"],
    description: "Second largest city in Sierra Leone and primary administrative center of the South.",
    coordinates: { x: 220, y: 240 },
  },
  {
    id: "bonthe",
    name: "Bonthe",
    province: "Southern Province",
    headquarters: "Mattru Jong",
    staples: ["Piassava", "Fish", "Rice", "Rutile"],
    description: "Coastal and island district featuring Sherbro Island and rich Atlantic fisheries.",
    coordinates: { x: 175, y: 310 },
  },
  {
    id: "pujehun",
    name: "Pujehun",
    province: "Southern Province",
    headquarters: "Pujehun",
    staples: ["Palm Oil", "Rubber", "Cassava", "Timber"],
    description: "Southernmost territory bordering Liberia with extensive oil palm plantations.",
    coordinates: { x: 255, y: 315 },
  },
];

export function getDistrictByName(name: string): DistrictInfo | undefined {
  const norm = name.trim().toLowerCase();
  return SL_DISTRICTS.find(
    (d) =>
      d.name.toLowerCase() === norm ||
      d.headquarters.toLowerCase() === norm ||
      d.id.toLowerCase() === norm
  );
}

export function getProvinceById(id: string): ProvinceInfo | undefined {
  return SL_PROVINCES.find((p) => p.id === id);
}

export function getProvinceForDistrict(districtName: string): ProvinceInfo | undefined {
  const district = getDistrictByName(districtName);
  if (!district) return undefined;
  return SL_PROVINCES.find((p) => p.name === district.province);
}
