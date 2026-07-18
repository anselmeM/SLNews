"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProfileCard({
  name, email, image, bio,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  bio?: string | null;
}) {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden sticky top-24">
      <div className="h-24 bg-gradient-to-br from-primary/80 to-primary/40" />
      <div className="px-6 pb-6">
        <div className="relative -mt-12 mb-4 flex justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-surface-container-lowest overflow-hidden shadow-lg bg-surface-container flex items-center justify-center">
            {image && !avatarError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.startsWith("/") ? image : `/api/image-proxy?url=${encodeURIComponent(image)}`}
                alt={name ? `${name}'s avatar` : "User avatar"}
                className="object-cover w-full h-full"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="text-3xl font-bold text-on-surface-variant">{(name || "U").charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-on-surface">{name || "Unknown User"}</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">{email || "No email"}</p>
          {bio && (
            <p className="text-sm text-on-surface-variant mt-2 px-2 italic line-clamp-2">&ldquo;{bio}&rdquo;</p>
          )}
          <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mt-3">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            Verified Reader
          </div>
        </div>
        <Link href="/profile/edit" className="block w-full mt-6 py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-medium text-sm transition-colors border border-outline-variant text-center min-h-[44px] flex items-center justify-center">
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
