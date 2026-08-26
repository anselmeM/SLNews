"use client";

import { m, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { vibrateLight, vibrate } from "@/lib/haptics";
import {
  SL_PROVINCES,
  SL_DISTRICTS,
  type DistrictInfo,
  getDistrictByName,
} from "@/lib/sl-districts";

interface SierraLeoneDistrictMapProps {
  selectedProvince?: string;
  selectedDistrict?: string;
  onSelectRegion: (province?: string, district?: string) => void;
  articleCount?: number;
}

export default function SierraLeoneDistrictMap({
  selectedProvince,
  selectedDistrict,
  onSelectRegion,
  articleCount,
}: SierraLeoneDistrictMapProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictInfo | null>(null);
  const [activeProvinceTab, setActiveProvinceTab] = useState<string>(
    selectedProvince || "all"
  );

  const activeDistrictInfo = selectedDistrict ? getDistrictByName(selectedDistrict) : null;

  const handleProvinceTab = (provId: string) => {
    vibrateLight();
    setActiveProvinceTab(provId);
    if (provId === "all") {
      onSelectRegion(undefined, undefined);
    } else {
      const prov = SL_PROVINCES.find((p) => p.id === provId);
      if (prov) {
        onSelectRegion(prov.name, undefined);
      }
    }
  };

  const handleDistrictClick = (district: DistrictInfo) => {
    vibrate(15);
    if (selectedDistrict === district.name) {
      // Toggle off
      onSelectRegion(district.province, undefined);
    } else {
      onSelectRegion(district.province, district.name);
    }
  };

  const handleReset = () => {
    vibrateLight();
    setActiveProvinceTab("all");
    onSelectRegion(undefined, undefined);
  };

  const displayedDistricts =
    activeProvinceTab === "all"
      ? SL_DISTRICTS
      : SL_DISTRICTS.filter(
          (d) =>
            d.province.toLowerCase() ===
            SL_PROVINCES.find((p) => p.id === activeProvinceTab)?.name.toLowerCase()
        );

  return (
    <section
      aria-label="Interactive Sierra Leone District Map"
      className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-5 sm:p-7 shadow-xs mb-8 overflow-hidden transition-all"
    >
      {/* Header & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">explore</span>
              Interactive Territory Map
            </span>
            {selectedDistrict && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-bold text-xs">
                {selectedDistrict}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">
            Explore Sierra Leone by District
          </h2>
        </div>

        {(selectedProvince || selectedDistrict) && (
          <button
            type="button"
            onClick={handleReset}
            className="self-start sm:self-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">replay</span>
            Reset to All Sierra Leone
          </button>
        )}
      </div>

      {/* Province Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar scroll-smooth">
        <button
          type="button"
          onClick={() => handleProvinceTab("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeProvinceTab === "all" && !selectedDistrict
              ? "bg-primary text-on-primary shadow-xs"
              : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
          }`}
        >
          All Sierra Leone (16)
        </button>
        {SL_PROVINCES.map((prov) => {
          const isSelected = activeProvinceTab === prov.id;
          return (
            <button
              key={prov.id}
              type="button"
              onClick={() => handleProvinceTab(prov.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-on-surface text-surface shadow-xs"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: prov.color }}
              />
              {prov.shortName}
            </button>
          );
        })}
      </div>

      {/* Main Grid: SVG Map Visual + District Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mt-3">
        {/* SVG Visual Map Column */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-surface-container-low/60 dark:bg-surface-container/30 rounded-2xl border border-outline-variant/30 relative">
          <svg
            viewBox="0 0 420 380"
            className="w-full max-w-[340px] sm:max-w-[380px] h-auto drop-shadow-sm select-none"
            role="img"
            aria-label="Map of Sierra Leone districts"
          >
            <defs>
              {/* Regional Gradients */}
              <radialGradient id="grad-western" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.95" />
              </radialGradient>
              <radialGradient id="grad-northwest" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
              </radialGradient>
              <radialGradient id="grad-northern" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.95" />
              </radialGradient>
              <radialGradient id="grad-southern" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.95" />
              </radialGradient>
              <radialGradient id="grad-eastern" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#9333ea" stopOpacity="0.95" />
              </radialGradient>
            </defs>

            {/* Sierra Leone Province Geographic Polygon Zones */}
            {/* 1. North-West Province (Kambia, Port Loko, Karene) */}
            <path
              d="M 60,110 L 140,55 L 185,95 L 170,175 L 115,195 L 50,150 Z"
              fill="url(#grad-northwest)"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
              className={`transition-opacity cursor-pointer duration-300 ${
                activeProvinceTab === "north-west" || activeProvinceTab === "all"
                  ? "opacity-90 hover:opacity-100"
                  : "opacity-35"
              }`}
              onClick={() => handleProvinceTab("north-west")}
            />

            {/* 2. Northern Province (Bombali, Tonkolili, Koinadugu, Falaba) */}
            <path
              d="M 185,95 L 260,40 L 375,50 L 360,140 L 270,170 L 180,165 Z"
              fill="url(#grad-northern)"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
              className={`transition-opacity cursor-pointer duration-300 ${
                activeProvinceTab === "northern" || activeProvinceTab === "all"
                  ? "opacity-90 hover:opacity-100"
                  : "opacity-35"
              }`}
              onClick={() => handleProvinceTab("northern")}
            />

            {/* 3. Eastern Province (Kono, Kenema, Kailahun) */}
            <path
              d="M 270,170 L 360,140 L 400,225 L 340,290 L 275,245 Z"
              fill="url(#grad-eastern)"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
              className={`transition-opacity cursor-pointer duration-300 ${
                activeProvinceTab === "eastern" || activeProvinceTab === "all"
                  ? "opacity-90 hover:opacity-100"
                  : "opacity-35"
              }`}
              onClick={() => handleProvinceTab("eastern")}
            />

            {/* 4. Southern Province (Bo, Moyamba, Bonthe, Pujehun) */}
            <path
              d="M 115,195 L 180,165 L 275,245 L 285,345 L 195,355 L 135,290 Z"
              fill="url(#grad-southern)"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
              className={`transition-opacity cursor-pointer duration-300 ${
                activeProvinceTab === "southern" || activeProvinceTab === "all"
                  ? "opacity-90 hover:opacity-100"
                  : "opacity-35"
              }`}
              onClick={() => handleProvinceTab("southern")}
            />

            {/* 5. Western Area Peninsula (Urban / Rural) */}
            <path
              d="M 50,175 L 85,185 L 105,235 L 75,260 L 45,210 Z"
              fill="url(#grad-western)"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
              className={`transition-opacity cursor-pointer duration-300 ${
                activeProvinceTab === "western" || activeProvinceTab === "all"
                  ? "opacity-95 hover:opacity-100"
                  : "opacity-35"
              }`}
              onClick={() => handleProvinceTab("western")}
            />

            {/* District Interactive Pins & Labels */}
            {SL_DISTRICTS.map((d) => {
              const isSelected = selectedDistrict === d.name;
              const isHovered = hoveredDistrict?.id === d.id;

              return (
                <g
                  key={d.id}
                  transform={`translate(${d.coordinates.x}, ${d.coordinates.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDistrictClick(d);
                  }}
                  onMouseEnter={() => setHoveredDistrict(d)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                >
                  <circle
                    r={isSelected ? 10 : isHovered ? 8 : 5.5}
                    fill={isSelected ? "#ffffff" : "#0f172a"}
                    stroke={isSelected ? "#000000" : "#ffffff"}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition-all duration-200"
                  />
                  {isSelected && (
                    <circle
                      r={14}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="animate-ping opacity-75"
                    />
                  )}
                  <text
                    y={isSelected ? -14 : -9}
                    textAnchor="middle"
                    className={`text-[9px] font-black pointer-events-none fill-slate-900 dark:fill-white transition-opacity ${
                      isSelected || isHovered ? "opacity-100 font-bold" : "opacity-0 sm:opacity-75"
                    }`}
                  >
                    {d.name.replace("Western Area ", "W. ")}
                  </text>
                </g>
              );
            })}
          </svg>

          <span className="text-[10px] text-on-surface-variant font-medium mt-1">
            Tap any region or district pin to filter live coverage
          </span>
        </div>

        {/* District Detail & Quick-Selector Column */}
        <div className="lg:col-span-6 flex flex-col justify-between h-full">
          <AnimatePresence mode="wait">
            {activeDistrictInfo ? (
              <m.div
                key={activeDistrictInfo.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-surface-container rounded-2xl p-4 sm:p-5 border border-outline-variant/40 mb-4"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">
                      {activeDistrictInfo.province}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-on-surface">
                      {activeDistrictInfo.name}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface">
                    HQ: {activeDistrictInfo.headquarters}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-on-surface-variant mb-3 leading-relaxed">
                  {activeDistrictInfo.description}
                </p>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase mr-1">
                    Key Sectors:
                  </span>
                  {activeDistrictInfo.staples.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-surface-container-lowest border border-outline-variant/40 text-[11px] font-semibold text-on-surface"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </m.div>
            ) : (
              <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 border border-outline-variant/30 mb-4">
                <h3 className="text-sm font-bold text-on-surface mb-1">
                  {activeProvinceTab === "all"
                    ? "Nationwide Sierra Leone Coverage"
                    : `${SL_PROVINCES.find((p) => p.id === activeProvinceTab)?.name} Coverage`}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Select a district below to see stories, localized commodity prices, and community updates.
                </p>
              </div>
            )}
          </AnimatePresence>

          {/* Quick-Pick District Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Districts ({displayedDistricts.length})
              </span>
              {articleCount !== undefined && (
                <span className="text-xs font-semibold text-primary">
                  {articleCount} Stories Found
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
              {displayedDistricts.map((dist) => {
                const isSelected = selectedDistrict === dist.name;
                return (
                  <button
                    key={dist.id}
                    type="button"
                    onClick={() => handleDistrictClick(dist)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? "bg-primary text-on-primary shadow-xs scale-102"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                    }`}
                  >
                    <span>{dist.name}</span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-xs">check</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
