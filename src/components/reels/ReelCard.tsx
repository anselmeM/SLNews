"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ReelVideo } from "@/app/actions/reel-actions";
import { useToast } from "@/components/Toast";
import { vibrateLight, vibrateSuccess } from "@/lib/haptics";
import { parseVideoUrl } from "@/lib/video-embed";
import { formatArticleWhatsAppDigest, getWhatsAppShareUrl } from "@/lib/whatsapp-formatter";

interface ReelCardProps {
  reel: ReelVideo;
  isActive: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function ReelCard({ reel, isActive, onNext, onPrev }: ReelCardProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(18);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const parsed = parseVideoUrl(reel.videoUrl);

  const handleLike = () => {
    vibrateLight();
    if (liked) {
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      toast("Added to your liked reels", "success");
    }
  };

  const handleBookmark = () => {
    vibrateLight();
    setSaved(!saved);
    toast(saved ? "Removed from saved" : "Saved to your bookmarks", "success");
  };

  const handleWhatsApp = () => {
    vibrateSuccess();
    const digestText = formatArticleWhatsAppDigest(
      {
        id: reel.id,
        title: reel.title,
        summary: reel.summary,
        content: reel.summary,
        location: reel.location,
        category: reel.category,
      },
      typeof window !== "undefined" ? window.location.origin : "https://slnews.sl"
    );
    const waUrl = getWhatsAppShareUrl(digestText);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative w-full h-[100dvh] snap-start snap-always flex items-center justify-center bg-black overflow-hidden select-none">
      {/* 9:16 Video Container (Centered on desktop, full-width on mobile) */}
      <div className="relative w-full max-w-[440px] h-full bg-slate-950 flex items-center justify-center overflow-hidden shadow-2xl">
        {/* Background / Video Layer */}
        {isActive ? (
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            {parsed.provider === "direct" ? (
              <video
                src={parsed.embedUrl}
                autoPlay
                loop
                playsInline
                controls
                className="w-full h-full object-cover"
                onLoadedData={() => setVideoLoaded(true)}
              />
            ) : (
              <iframe
                src={parsed.embedUrl}
                title={reel.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setVideoLoaded(true)}
              />
            )}

            {!videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          /* Static High-Resolution Thumbnail Poster (Data-Saver / Inactive Reel) */
          <div className="w-full h-full relative">
            <Image
              src={reel.thumbnailUrl}
              alt={reel.title}
              fill
              sizes="(max-width: 640px) 100vw, 440px"
              className="object-cover brightness-75"
              priority={false}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="w-16 h-16 rounded-full bg-primary/80 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-3xl">play_arrow</span>
              </span>
            </div>
          </div>
        )}

        {/* Top Header Controls */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
          <Link
            href="/home"
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            aria-label="Back to Home"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              SLNews Shorts
            </span>
          </div>
        </div>

        {/* Bottom Metadata Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-auto text-white">
          {/* Source / Channel Badge */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg text-primary">live_tv</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm leading-tight text-white drop-shadow-sm">
                  {reel.source}
                </span>
                <span className="material-symbols-outlined text-primary text-[14px]">
                  verified
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/75 font-medium">
                <span>{reel.category}</span>
                {reel.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-white/90">
                      <span className="material-symbols-outlined text-[12px]">location_on</span>
                      {reel.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Headline Title */}
          <h2 className="text-base font-bold leading-snug mb-1.5 drop-shadow-sm text-white">
            {reel.title}
          </h2>

          {/* Summary / Caption */}
          <p
            onClick={() => setExpanded(!expanded)}
            className={`text-xs text-white/80 leading-relaxed cursor-pointer ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            {reel.summary}
            {!expanded && reel.summary.length > 90 && (
              <span className="text-primary font-semibold ml-1">...more</span>
            )}
          </p>

          {/* Read Full Story Button if linked to article */}
          {reel.id.startsWith("reel-") ? null : (
            <Link
              href={`/article/${reel.id}`}
              className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition-colors"
            >
              <span>Read Full Article</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          )}
        </div>

        {/* Right Floating Action Rail */}
        <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4 text-white pointer-events-auto">
          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            className="flex flex-col items-center gap-1 group cursor-pointer"
            aria-label="Like video"
          >
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
              <span
                className={`material-symbols-outlined text-2xl transition-colors ${
                  liked ? "text-red-500" : "text-white group-hover:text-red-400"
                }`}
                style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                favorite
              </span>
            </div>
            <span className="text-[11px] font-bold drop-shadow-sm">{likeCount}</span>
          </button>

          {/* WhatsApp 1-Tap Share */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex flex-col items-center gap-1 group cursor-pointer"
            aria-label="Share video on WhatsApp"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-600/80 backdrop-blur-md border border-white/20 flex items-center justify-center active:scale-90 transition-transform text-white">
              <span className="material-symbols-outlined text-2xl">chat</span>
            </div>
            <span className="text-[11px] font-bold drop-shadow-sm">WhatsApp</span>
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={handleBookmark}
            className="flex flex-col items-center gap-1 group cursor-pointer"
            aria-label="Bookmark reel"
          >
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
              <span
                className={`material-symbols-outlined text-2xl transition-colors ${
                  saved ? "text-primary" : "text-white"
                }`}
                style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                bookmark
              </span>
            </div>
            <span className="text-[11px] font-bold drop-shadow-sm">Save</span>
          </button>

          {/* Desktop Next/Prev Arrow Controls */}
          {onPrev && (
            <button
              type="button"
              onClick={onPrev}
              className="hidden md:flex w-9 h-9 rounded-full bg-black/50 border border-white/10 items-center justify-center hover:bg-black/80 transition-colors"
              aria-label="Previous video"
            >
              <span className="material-symbols-outlined text-lg">keyboard_arrow_up</span>
            </button>
          )}

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="hidden md:flex w-9 h-9 rounded-full bg-black/50 border border-white/10 items-center justify-center hover:bg-black/80 transition-colors"
              aria-label="Next video"
            >
              <span className="material-symbols-outlined text-lg">keyboard_arrow_down</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
