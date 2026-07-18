"use client";

import Image from "next/image";
import { useState } from "react";

export default function ArticleImage({
  src,
  alt,
  fill,
  sizes,
  className,
  priority,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Image
        src="/globe.svg"
        alt={alt}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={className}
      />
    );
  }

  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/image-proxy?url=${encodeURIComponent(src)}`}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className={className}
      onError={() => setFailed(true)}
      style={fill ? { position: "absolute", height: "100%", width: "100%", inset: 0, objectFit: "cover" } : undefined}
    />
  );
}
