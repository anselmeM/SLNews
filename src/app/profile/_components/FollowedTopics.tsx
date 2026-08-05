"use client";

import { useState } from "react";
import { savePreferences } from "@/app/actions/user-actions";
import { useToast, type ToastType } from "@/components/Toast";
import { SL_TOPICS } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";

export default function FollowedTopics({
  topics,
  onClear,
}: {
  topics: string[];
  onClear: () => void;
}) {
  const { toast } = useToast();
  const setPreferences = useAppStore((s) => s.setPreferences);
  const [showTopicPicker, setShowTopicPicker] = useState(false);

  const hasTopics = topics.length > 0;
  const availableTopics = SL_TOPICS.filter((t) => !topics.includes(t));

  const updateTopics = async (next: string[], message: string, type: ToastType) => {
    setPreferences(null, next);
    try {
      await savePreferences(null, next);
      toast(message, type);
    } catch {
      setPreferences(null, topics);
      toast("Could not update preferences", "error");
    }
  };

  const addTopic = (t: string) => {
    setShowTopicPicker(false);
    void updateTopics([...topics, t], `Following ${t}`, "success");
  };

  const removeTopic = (t: string) =>
    void updateTopics(topics.filter((x) => x !== t), `Unfollowed ${t}`, "info");

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>interests</span>
          Topics You Follow
        </h3>
        <div className="flex gap-2">
          {showTopicPicker && availableTopics.length > 0 && (
            <button
              onClick={() => setShowTopicPicker(false)}
              className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              Done
            </button>
          )}
          {!showTopicPicker && availableTopics.length > 0 && (
            <button
              onClick={() => setShowTopicPicker(true)}
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Add
            </button>
          )}
          {hasTopics && (
            <button
              onClick={onClear}
              className="text-sm font-semibold text-on-surface-variant hover:text-error transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {hasTopics ? (
        <div className="flex flex-wrap gap-2">
          {topics.map((item) => (
            <button
              key={item}
              onClick={() => removeTopic(item)}
              className="inline-flex items-center gap-1.5 bg-surface-container-low border border-outline-variant px-3.5 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:bg-error-container hover:text-on-error-container hover:border-error transition-all cursor-pointer"
            >
              {item}
              <span className="material-symbols-outlined text-[16px] opacity-60 hover:opacity-100 transition-opacity">close</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant mb-3">
          No topics selected. Follow topics to personalize your news feed.
        </p>
      )}

      {showTopicPicker && availableTopics.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-outline-variant/50">
          {availableTopics.map((t) => (
            <button
              key={t}
              onClick={() => addTopic(t)}
              className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3.5 py-2 rounded-full text-sm font-semibold text-primary hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {t}
            </button>
          ))}
        </div>
      )}

      {!hasTopics && !showTopicPicker && (
        <button
          onClick={() => setShowTopicPicker(true)}
          className="mt-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer min-h-[44px]"
        >
          Set Your Preferences
        </button>
      )}
    </section>
  );
}
