"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/** Same display size everywhere: fixed height, full width, cover. */
interface ProfileBannerProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProfileBanner({ src, alt, className }: ProfileBannerProps) {
  return (
    <div
      className={cn(
        "relative w-full h-32 sm:h-48 overflow-hidden",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 1200px"
        priority={false}
      />
    </div>
  );
}
