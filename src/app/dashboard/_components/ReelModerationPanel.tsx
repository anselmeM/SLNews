"use client";

import { useState, useTransition } from "react";
import { approveCommunityReel, rejectCommunityReel, promoteUserToCreator } from "@/app/actions/reel-actions";
import type { ReelVideo } from "@/app/actions/reel-actions";
import { useToast } from "@/components/Toast";
import { vibrateSuccess, vibrateLight } from "@/lib/haptics";
import { parseVideoUrl } from "@/lib/video-embed";

export default function ReelModerationPanel({ initialReels }: { initialReels: ReelVideo[] }) {
  const { toast } = useToast();
  const [reels, setReels] = useState<ReelVideo[]>(initialReels);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (reelId: string) => {
    vibrateSuccess();
    startTransition(async () => {
      const res = await approveCommunityReel(reelId);
      if (res.success) {
        setReels((prev) => prev.filter((r) => r.id !== reelId));
        toast("Video approved & published to Shorts!", "success");
      } else {
        toast(res.message, "error");
      }
    });
  };

  const handleReject = (reelId: string) => {
    vibrateLight();
    startTransition(async () => {
      const res = await rejectCommunityReel(reelId);
      if (res.success) {
        setReels((prev) => prev.filter((r) => r.id !== reelId));
        toast("Video rejected.", "info");
      } else {
        toast(res.message, "error");
      }
    });
  };

  const handlePromote = (userId: string, authorName: string) => {
    vibrateSuccess();
    startTransition(async () => {
      const res = await promoteUserToCreator(userId);
      if (res.success) {
        toast(`${authorName} is now a Verified Creator (WRITER)!`, "success");
      } else {
        toast(res.message, "error");
      }
    });
  };

  if (reels.length === 0) {
    return (
      <div className="p-8 text-center rounded-3xl bg-surface-container-low border border-outline-variant/30 text-on-surface-variant text-sm">
        <span className="material-symbols-outlined text-4xl text-primary mb-2 block">
          check_circle
        </span>
        <p className="font-semibold text-on-surface">No Pending Video Submissions</p>
        <p className="text-xs text-on-surface-variant mt-1">
          All citizen video reels and community submissions have been reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reels.map((reel) => {
        const parsed = parseVideoUrl(reel.videoUrl);
        return (
          <div
            key={reel.id}
            className="p-5 rounded-3xl bg-surface dark:bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                    {reel.category}
                  </span>
                  {reel.location && (
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-medium">
                      📍 {reel.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
                    <span className="material-symbols-outlined text-[13px]">
                      {parsed.providerIcon}
                    </span>
                    {parsed.providerLabel}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-on-surface">{reel.title}</h3>
                {reel.summary && (
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                    {reel.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Video Link */}
            <div className="p-2.5 rounded-2xl bg-surface-container-low text-xs text-on-surface-variant flex items-center justify-between gap-2 truncate">
              <span className="truncate">{reel.videoUrl}</span>
              <a
                href={reel.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-primary font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Open Source</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            </div>

            {/* Submitter & Actions Rail */}
            <div className="pt-2 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant">Submitted by:</span>
                <span className="font-bold text-on-surface">{reel.source}</span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handlePromote(reel.authorId, reel.source)}
                  className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-bold text-[10px] transition-colors cursor-pointer inline-flex items-center gap-1"
                  title="Promote to Verified Creator so their future posts go live instantly"
                >
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  <span>Verify Creator</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReject(reel.id)}
                  className="px-4 py-1.5 rounded-full border border-error/30 text-error hover:bg-error/10 font-bold transition-colors cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleApprove(reel.id)}
                  className="px-4 py-1.5 rounded-full bg-primary text-white hover:bg-primary/95 font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Approve & Publish
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
