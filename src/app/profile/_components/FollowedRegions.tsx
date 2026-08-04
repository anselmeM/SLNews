"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { SL_REGIONS } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";
import { savePreferences } from "@/app/actions/user-actions";

export default function FollowedRegions({
  region,
  topics,
  onClear,
}: {
  region: string | null;
  topics: string[];
  onClear: () => void;
}) {
  const { toast } = useToast();
  const setPreferences = useAppStore((s) => s.setPreferences);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const hasPreferences = region || topics.length > 0;

  const displayRegions = [
    ...(region ? [region] : []),
    ...topics.filter((t) => t !== region),
  ];

  const addRegion = async (r: string) => {
    setPreferences(r, topics);
    setShowRegionPicker(false);
    try {
      await savePreferences(r, topics);
      toast(`Now following ${r}`, "success");
    } catch {
      setPreferences(region, topics);
      toast("Could not update preferences", "error");
    }
  };

  const removeRegion = async (r: string) => {
    const newTopics = topics.filter((t) => t !== r);
    if (r === region) {
      setPreferences(null, newTopics);
    } else {
      setPreferences(region, newTopics);
    }
    try {
      await savePreferences(r === region ? null : region, newTopics);
      toast(`Unfollowed ${r}`, "info");
    } catch {
      setPreferences(region, topics);
      toast("Could not update preferences", "error");
    }
  };

  const availableRegions = SL_REGIONS.filter(
    (r) => !displayRegions.includes(r)
  );

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
          Followed Regions &amp; Topics
        </h3>
        <div className="flex gap-2">
          {showRegionPicker && availableRegions.length > 0 && (
            <button
              onClick={() => setShowRegionPicker(false)}
              className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              Done
            </button>
          )}
          {!showRegionPicker && availableRegions.length > 0 && (
            <button
              onClick={() => setShowRegionPicker(true)}
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Add
            </button>
          )}
          {hasPreferences && (
            <button
              onClick={onClear}
              className="text-sm font-semibold text-on-surface-variant hover:text-error transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {hasPreferences ? (
        <div className="flex flex-wrap gap-2">
          {displayRegions.map((item) => (
            <button
              key={item}
              onClick={() => removeRegion(item)}
              className="inline-flex items-center gap-1.5 bg-surface-container-low border border-outline-variant px-3.5 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:bg-error-container hover:text-on-error-container hover:border-error transition-all cursor-pointer"
            >
              {item}
              <span className="material-symbols-outlined text-[16px] opacity-60 hover:opacity-100 transition-opacity">close</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant mb-3">
          No regions or topics selected. Follow regions to personalize your news feed.
        </p>
      )}

      {showRegionPicker && availableRegions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-outline-variant/50">
          {availableRegions.map((r) => (
            <button
              key={r}
              onClick={() => addRegion(r)}
              className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3.5 py-2 rounded-full text-sm font-semibold text-primary hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {r}
            </button>
          ))}
        </div>
      )}

      {!hasPreferences && !showRegionPicker && (
        <button
          onClick={() => setShowRegionPicker(true)}
          className="mt-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer min-h-[44px]"
        >
          Set Your Preferences
        </button>
      )}
    </section>
  );
}
