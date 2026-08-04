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

type Price = {
  id: string; commodity: string; price: number; trend: string | null; trendPct: number | null; trendPeriod: string | null;
};

export default function CommodityCard({ price }: { price: Price }) {
  const meta = META[price.commodity] || { icon: "shopping_bag", displayName: price.commodity, description: "", category: "Other", categoryClass: "bg-surface-variant text-on-surface-variant" };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 shadow-[0_4px_12px_rgba(27,28,28,0.08)] flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`px-3 py-1 rounded-full font-label-sm text-label-sm inline-block ${meta.categoryClass}`}>{meta.category}</div>
          <span className="material-symbols-outlined text-outline">{meta.icon}</span>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">{meta.displayName}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-4">{meta.description}</p>
      </div>
      <div>
        <div className="flex items-end gap-2 mb-2">
          <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-black">Le {price.price}</span>
          <span className="font-body-md text-body-md text-on-surface-variant pb-1">NLe</span>
        </div>
        {price.trend && (
          <div className={`flex items-center gap-2 ${trendColor(price.trend)}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{trendIcon(price.trend)}</span>
            <span className="font-label-md text-label-md">
              {price.trend === "stable" ? "Stable" : `${price.trend === "up" ? "+" : ""}${price.trendPct}% ${price.trendPeriod || ""}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
