"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { submitCommunityReel } from "@/app/actions/reel-actions";
import { useToast } from "@/components/Toast";
import { vibrateLight, vibrateSuccess } from "@/lib/haptics";
import { parseVideoUrl } from "@/lib/video-embed";

const SL_DISTRICTS = [
  "Freetown (Western Urban)",
  "Western Rural",
  "Bo",
  "Kenema",
  "Makeni (Bombali)",
  "Port Loko",
  "Kono",
  "Kambia",
  "Tonkolili",
  "Kailahun",
  "Bonthe",
  "Pujehun",
  "Karene",
  "Koinadugu",
  "Falaba",
  "Moyamba",
  "National",
];

const CATEGORIES = [
  "National",
  "Politics",
  "Economy",
  "Sports",
  "Culture",
  "Agriculture",
  "Education",
];

export default function SubmitReelModal() {
  const { isSignedIn, user } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("National");
  const [location, setLocation] = useState("Freetown (Western Urban)");
  const [loading, setLoading] = useState(false);

  const parsed = videoUrl.trim() ? parseVideoUrl(videoUrl) : null;

  const isPrivileged =
    user?.publicMetadata?.role === "ADMIN" ||
    user?.publicMetadata?.role === "EDITOR" ||
    user?.publicMetadata?.role === "WRITER";

  const handleOpen = () => {
    vibrateLight();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast("Please sign in to submit a video clip.", "error");
      return;
    }

    if (!title.trim() || title.trim().length < 5) {
      toast("Please provide a descriptive headline.", "error");
      return;
    }

    if (!videoUrl.trim() || !videoUrl.startsWith("http")) {
      toast("Please provide a valid video link.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await submitCommunityReel({
        title,
        summary,
        videoUrl,
        category,
        location,
      });

      if (res.success) {
        vibrateSuccess();
        toast(res.message, "success");
        setOpen(false);
        setVideoUrl("");
        setTitle("");
        setSummary("");
      } else {
        toast(res.message, "error");
      }
    } catch {
      toast("An error occurred while submitting.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button on /reels */}
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-24 right-4 z-40 md:bottom-8 md:right-8 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-[0_8px_24px_rgba(0,104,55,0.4)] hover:bg-primary/95 active:scale-95 transition-all cursor-pointer border border-white/20"
        aria-label="Post video reel"
      >
        <span className="material-symbols-outlined text-xl">add_circle</span>
        <span>Post Clip</span>
      </button>

      {/* Modal Backdrop */}
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-surface dark:bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">videocam</span>
                </span>
                <div>
                  <h2 className="text-lg font-bold text-on-surface leading-tight">
                    Share News Clip or Reel
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Facebook, Instagram, YouTube Shorts, or TikTok
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center text-on-surface-variant cursor-pointer"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {!isSignedIn ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">lock</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Sign In to Post</h3>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-xs mx-auto">
                    Join our community of Sierra Leone citizen journalists and local creators.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link
                    href="/sign-in"
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Privilege Info Box */}
                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-2.5 text-xs">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5">
                    {isPrivileged ? "verified" : "info"}
                  </span>
                  <div className="text-on-surface-variant leading-relaxed">
                    {isPrivileged ? (
                      <span className="text-primary font-semibold">
                        ✨ Verified Creator: Your clip will go LIVE immediately upon submission!
                      </span>
                    ) : (
                      <span>
                        🛡️ Community Submission: Your video will be reviewed by editors before appearing on Shorts.
                      </span>
                    )}
                  </div>
                </div>

                {/* Video URL Input */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Video Link <span className="text-primary">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.facebook.com/watch/... or instagram.com/reel/..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
                  />
                  {parsed && parsed.provider !== "unknown" && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-primary font-medium">
                      <span className="material-symbols-outlined text-[14px]">
                        {parsed.providerIcon}
                      </span>
                      <span>{parsed.providerLabel} detected</span>
                    </div>
                  )}
                </div>

                {/* Headline Input */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Headline / What Happened? <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Traffic disruption along Lumley Beach Road cleared"
                    className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Category & District Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-xs font-medium text-on-surface focus:outline-none focus:border-primary transition-colors"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      District / City
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-xs font-medium text-on-surface focus:outline-none focus:border-primary transition-colors"
                    >
                      {SL_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Short Summary (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Brief Summary / Context (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Add any extra details, eyewitness commentary, or source credits..."
                    className="w-full px-4 py-2 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/95 disabled:opacity-50 transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {loading && (
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    )}
                    <span>{isPrivileged ? "Publish Clip" : "Submit Clip"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
