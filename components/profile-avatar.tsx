"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "default" | "lg";
  fallback?: string;
  className?: string;
}

export function ProfileAvatar({
  src,
  alt,
  size = "default",
  fallback,
  className,
}: ProfileAvatarProps) {
  const fallbackLetter = fallback?.slice(0, 1).toUpperCase() ?? alt.slice(0, 1).toUpperCase();

  return (
    <Avatar size={size} className={cn(className)}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{fallbackLetter}</AvatarFallback>
    </Avatar>
  );
}
