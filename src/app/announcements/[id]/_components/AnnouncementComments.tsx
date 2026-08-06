"use client";

import { formatShortDate } from "@/lib/format-date";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { vibrate } from "@/lib/haptics";

type CommentUser = { id: string; name: string | null; image: string | null };
type CommentData = {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
};

function timeAgo(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(dateStr);
}

function UserAvatar({ user, size = 10 }: { user: CommentUser; size?: number }) {
  const initial = (user.name || "A").charAt(0).toUpperCase();
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-surface-variant overflow-hidden shrink-0 flex items-center justify-center`}
    >
      {user.image ? (
        <img
          src={user.image.startsWith("/") ? user.image : `/api/image-proxy?url=${encodeURIComponent(user.image)}`}
          alt={user.name || "User"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs font-bold text-on-surface-variant">{initial}</span>
      )}
    </div>
  );
}

export default function AnnouncementComments({ announcementId }: { announcementId: string }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/announcements/${announcementId}/comments`);
        if (res.ok && !cancelled) setComments(await res.json());
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [announcementId]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/announcements/${announcementId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post comment");
        if (res.status === 429) toast("You're commenting too quickly. Try again later.", "info");
        return;
      }

      setText("");
      const res2 = await fetch(`/api/announcements/${announcementId}/comments`);
      if (res2.ok) setComments(await res2.json());
      vibrate();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12">
      <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 border border-outline-variant/50 shadow-sm">
        <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "20px" }}>chat_bubble</span>
          Comments{comments.length > 0 ? ` (${comments.length})` : ""}
        </h2>

        {loading ? (
          <p className="text-sm text-on-surface-variant animate-pulse">Loading comments...</p>
        ) : (
          <>
            {comments.length === 0 && (
              <p className="text-sm text-on-surface-variant mb-6">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}

            {comments.length > 0 && (
              <div className="space-y-5 mb-8">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <UserAvatar user={c.user} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-on-surface truncate">
                          {c.user.name || "Anonymous"}
                        </span>
                        <span className="text-xs text-on-surface-variant shrink-0">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap break-words">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {session?.user ? (
              <div className="border-t border-outline-variant/30 pt-5">
                <div className="flex gap-3">
                  <UserAvatar user={{ id: session.user.id!, name: session.user.name ?? null, image: session.user.image ?? null }} />
                  <div className="flex-1 min-w-0">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={3}
                      maxLength={2000}
                      className="w-full resize-none rounded-xl bg-surface-container border border-outline-variant/50 p-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${text.length > 1900 ? "text-error" : "text-on-surface-variant"}`}>
                        {text.length}/2000
                      </span>
                      <button
                        onClick={handleSubmit}
                        disabled={!text.trim() || submitting}
                        className="px-5 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        {submitting ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                    {error && (
                      <p className="text-sm text-error mt-2">{error}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-outline-variant/30 pt-5 text-center">
                <p className="text-sm text-on-surface-variant mb-3">
                  <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link> to leave a comment.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
