const META: Record<string, { icon: string; displayName: string; description: string; category: string; categoryClass: string }> = {
  "Rice (50kg)": { icon: "shopping_bag", displayName: "Rice (50kg Bag)", description: "Imported - Uncle Sam", category: "Essential", categoryClass: "bg-primary/10 text-primary" },
  "Rice (cup)": { icon: "shopping_bag", displayName: "Rice (Per Cup)", description: "Local market price", category: "Essential", categoryClass: "bg-primary/10 text-primary" },
  Petrol: { icon: "local_gas_station", displayName: "Petrol (Liter)", description: "Pump Price", category: "Energy", categoryClass: "bg-secondary/10 text-secondary" },
  Diesel: { icon: "local_gas_station", displayName: "Diesel (Liter)", description: "Pump Price", category: "Energy", categoryClass: "bg-secondary/10 text-secondary" },
  Kerosene: { icon: "local_gas_station", displayName: "Kerosene (Liter)", description: "Pump Price", category: "Energy", categoryClass: "bg-secondary/10 text-secondary" },
  "Palm Oil": { icon: "water_drop", displayName: "Palm Oil (Liter)", description: "Locally Sourced", category: "Local Produce", categoryClass: "bg-primary/10 text-primary" },
  "Cement (Imported)": { icon: "foundation", displayName: "Cement (Imported Bag)", description: "Imported 42.5R", category: "Construction", categoryClass: "bg-tertiary/10 text-tertiary" },
  "Cement (Local)": { icon: "foundation", displayName: "Cement (Local Bag)", description: "Leocem 42.5R", category: "Construction", categoryClass: "bg-tertiary/10 text-tertiary" },
};

function trendColor(t: string | null) {
  if (t === "up") return "text-error";
  if (t === "down") return "text-primary";
  return "text-on-surface-variant";
}

function trendIcon(t: string | null) {
  if (t === "up") return "trending_up";
  if (t === "down") return "trending_down";
  return "horizontal_rule";
}

function Sparkline({ trend }: { trend: string | null }) {
  const isUp = trend === "up";
  const isDown = trend === "down";
  const color = isUp ? "var(--color-error, #ba1a1a)" : isDown ? "var(--color-primary, #006e1c)" : "var(--color-tertiary, #5f5e5b)";
  const points = isUp
    ? "0,22 8,19 16,21 24,15 32,17 40,11 48,14 56,6 64,8 72,2"
    : isDown
    ? "0,4 8,7 16,5 24,11 32,9 40,15 48,12 56,20 64,18 72,24"
    : "0,12 8,14 16,10 24,13 32,11 40,13 48,10 56,12 64,11 72,12";

  return (
    <svg
      className="w-16 h-6 overflow-visible opacity-85 shrink-0"
      viewBox="0 0 72 26"
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Price = {
  id: string; commodity: string; price: number; trend: string | null; trendPct: number | null; trendPeriod: string | null;
};

export default function CommodityCard({ price }: { price: Price }) {
  const meta = META[price.commodity] || { icon: "shopping_bag", displayName: price.commodity, description: "", category: "Other", categoryClass: "bg-surface-variant text-on-surface-variant" };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 shadow-[0_4px_12px_rgba(27,28,28,0.08)] flex flex-col justify-between h-full hover:shadow-[0_8px_16px_rgba(27,28,28,0.12)] transition-shadow">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`px-3 py-1 rounded-full font-label-sm text-label-sm inline-block ${meta.categoryClass}`}>{meta.category}</div>
          <span className="material-symbols-outlined text-outline">{meta.icon}</span>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">{meta.displayName}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-4">{meta.description}</p>
      </div>
      <div>
        <div className="flex items-end justify-between gap-2 mb-2">
          <div className="flex items-end gap-2">
            <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-black">Le {price.price}</span>
            <span className="font-body-md text-body-md text-on-surface-variant pb-1">NLe</span>
          </div>
          <Sparkline trend={price.trend} />
        </div>
        {price.trend && (
          <div className={`flex items-center gap-2 ${trendColor(price.trend)}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{trendIcon(price.trend)}</span>
            <span className="font-label-md text-label-md font-semibold">
              {price.trend === "stable" ? "Stable (Past 7 Days)" : `${price.trend === "up" ? "+" : ""}${price.trendPct ?? 0}% ${price.trendPeriod || "Past 7 Days"}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
