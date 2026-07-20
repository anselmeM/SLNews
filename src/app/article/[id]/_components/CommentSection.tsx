"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ShimmerBar } from "@/components/Shimmer";

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
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

function CommentSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <ShimmerBar className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerBar className="h-3 w-24" />
            <ShimmerBar className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CommentSection({ articleId }: { articleId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}/comments`);
        if (res.ok && !cancelled) setComments(await res.json());
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [articleId]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post comment");
        return;
      }

      setText("");
      const res2 = await fetch(`/api/articles/${articleId}/comments`);
      if (res2.ok) setComments(await res2.json());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mb-12">
      <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 border border-outline-variant/50 shadow-sm">
        <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "20px" }}>chat_bubble</span>
          Comments{comments.length > 0 ? ` (${comments.length})` : ""}
        </h3>

        {loading ? (
          <CommentSkeleton />
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
              <div className="border-t border-gray-100 pt-5">
                <div className="flex gap-3">
                  <UserAvatar user={{ id: session.user.id!, name: session.user.name ?? null, image: session.user.image ?? null }} />
                  <div className="flex-1 min-w-0">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={3}
                      maxLength={2000}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${text.length > 1900 ? "text-red-500" : "text-on-surface-variant"}`}>
                        {text.length}/2000
                      </span>
                      <button
                        onClick={handleSubmit}
                        disabled={!text.trim() || submitting}
                        className="px-5 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        {submitting ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                    {error && (
                      <p className="text-sm text-red-500 mt-2">{error}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-5 text-center">
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
