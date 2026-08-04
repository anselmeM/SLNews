"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toggleFollow } from "@/app/actions/follow-actions";
import { useToast } from "@/components/Toast";
import { vibrate } from "@/lib/haptics";

export default function FollowButton({
  authorId,
  initialFollowing,
  initialFollowerCount,
  variant = "default",
  callbackPath,
}: {
  authorId: string;
  initialFollowing: boolean;
  initialFollowerCount: number;
  variant?: "default" | "compact";
  callbackPath?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);

    const result = await toggleFollow(authorId);
    if (!result.success) {
    if (result.error?.includes("signed in")) {
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackPath || `/author/${authorId}`)}`);
    } else {
        toast(result.error || "Failed to update follow", "error");
      }
      setBusy(false);
      return;
    }

    setFollowing(result.following);
    setFollowerCount(result.followerCount);
    vibrate();
    toast(result.following ? "Now following" : "Unfollowed", result.following ? "success" : "info");
    setBusy(false);
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-pressed={following}
        className={`${
          following
            ? "bg-surface-container-highest text-on-surface border border-outline-variant/40"
            : "bg-primary text-on-primary border border-transparent"
        } font-label-sm text-label-sm px-3.5 py-1.5 rounded-full shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
          {following ? "check" : "notifications_active"}
        </span>
        {following ? "Following" : "Follow"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-pressed={following}
        className={`${
          following
            ? "bg-surface-container-highest text-on-surface border border-outline-variant/40"
            : "bg-primary text-on-primary border border-transparent"
        } font-label-md text-label-md px-6 py-2 rounded-full shadow-sm hover:bg-primary/95 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="material-symbols-outlined">
          {following ? "check" : "notifications_active"}
        </span>
        {following ? "Following" : "Follow"}
      </button>
      <span className="font-label-sm text-label-sm text-on-surface-variant" aria-label={`${followerCount} followers`}>
        {followerCount} follower{followerCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}
