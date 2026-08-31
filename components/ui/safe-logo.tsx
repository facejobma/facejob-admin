"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

type SafeLogoProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
};

function isDisplayableImageSource(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const source = value.trim();
  if (!source) return false;

  // UploadedFile temporary paths must never be exposed as persistent media URLs.
  if (/^[a-zA-Z]:[\\/]/.test(source) || source.startsWith("\\\\")) return false;

  if (source.startsWith("/")) return !source.startsWith("//");

  try {
    const url = new URL(source);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function SafeLogo({
  src,
  alt = "",
  className = "h-full w-full object-cover",
  fallbackClassName = "h-5 w-5 text-muted-foreground",
}: SafeLogoProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const normalizedSource = typeof src === "string" ? src.trim() : null;
  const canDisplay = isDisplayableImageSource(normalizedSource) && failedSource !== normalizedSource;

  if (!canDisplay) {
    return <Building2 aria-hidden="true" className={fallbackClassName} />;
  }

  // Native img is intentional here: enterprise logos may be hosted on customer/S3
  // domains that are not known when the admin application is built.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={normalizedSource} alt={alt} className={className} onError={() => setFailedSource(normalizedSource)} />;
}
