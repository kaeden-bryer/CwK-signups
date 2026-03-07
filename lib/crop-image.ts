/**
 * Canvas-based crop: given an image URL and crop area in pixels,
 * outputs a Blob (WebP) at fixed dimensions for avatar (circle) or banner (rect).
 */
export type Area = { x: number; y: number; width: number; height: number };

export const AVATAR_OUTPUT_SIZE = 256;
export const BANNER_OUTPUT_WIDTH = 1200;
export const BANNER_OUTPUT_HEIGHT = 300;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Crop image to a circle and output 256x256 WebP (avatar).
 */
export async function getCroppedAvatarBlob(
  imageUrl: string,
  crop: Area
): Promise<Blob> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  const size = AVATAR_OUTPUT_SIZE;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2d context not available");

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/webp",
      0.9
    );
  });
}

/**
 * Crop image to a rectangle and output 1200x300 WebP (banner).
 */
export async function getCroppedBannerBlob(
  imageUrl: string,
  crop: Area
): Promise<Blob> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = BANNER_OUTPUT_WIDTH;
  canvas.height = BANNER_OUTPUT_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2d context not available");

  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    BANNER_OUTPUT_WIDTH,
    BANNER_OUTPUT_HEIGHT
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/webp",
      0.9
    );
  });
}
