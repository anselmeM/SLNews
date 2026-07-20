"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { toggleReaction, getReactions } from "@/app/actions/reaction-actions";

const EMOJIS = [
  { emoji: "🔥", label: "Fire" },
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
];

export default function ReactionButtons({ articleId }: { articleId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [reactions, setReactions] = useState<Record<string, { count: number; reacted: boolean }>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getReactions(articleId);
      if (!cancelled) setReactions(data);
    })();
    return () => { cancelled = true; };
  }, [articleId]);

  const handleReact = async (emoji: string) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    const prev = { ...reactions };
    const current = reactions[emoji] || { count: 0, reacted: false };
    setReactions({
      ...reactions,
      [emoji]: {
        count: current.reacted ? current.count - 1 : current.count + 1,
        reacted: !current.reacted,
      },
    });

    try {
      await toggleReaction(articleId, emoji);
    } catch {
      setReactions(prev);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {EMOJIS.map(({ emoji, label }) => {
        const r = reactions[emoji];
        const active = r?.reacted ?? false;
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-full text-sm font-semibold transition-all cursor-pointer ${
              active
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-surface-container text-on-surface-variant border border-outline-variant/30 hover:border-primary/30"
            }`}
            aria-label={label}
          >
            <span className="text-base">{emoji}</span>
            {r && r.count > 0 && <span className="text-xs">{r.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
