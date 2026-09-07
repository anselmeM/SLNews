"use client";

import { useState } from "react";
import ArticleImage from "@/components/ArticleImage";
import DataSaverGuard from "@/components/DataSaverGuard";
import ImageLightbox from "@/components/ui/ImageLightbox";
import { vibrateLight } from "@/lib/haptics";

export default function ArticleHeroImage({
  imageUrl,
  title,
  location,
}: {
  imageUrl: string;
  title: string;
  location?: string | null;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <figure
        onClick={() => {
          vibrateLight();
          setLightboxOpen(true);
        }}
        className="relative w-full aspect-[16/9] md:aspect-[2/1] md:rounded-2xl overflow-hidden bg-surface-container -mx-4 sm:-mx-6 lg:mx-0 cursor-zoom-in group select-none"
      >
        <DataSaverGuard className="absolute inset-0">
          <ArticleImage
            src={imageUrl}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </DataSaverGuard>

        {/* Location Tag */}
        {location && (
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wide">
            {location}
          </span>
        )}

        {/* Expand Icon Hint */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-sm">fullscreen</span>
        </div>
      </figure>

      {/* Fullscreen Lightbox Modal */}
      <ImageLightbox
        isOpen={lightboxOpen}
        src={imageUrl}
        alt={title}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
