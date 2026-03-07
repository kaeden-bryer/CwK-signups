"use client";

import { useCallback, useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  getCroppedAvatarBlob,
  getCroppedBannerBlob,
} from "@/lib/crop-image";

type CropType = "avatar" | "banner";

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  type: CropType;
  onComplete: (blob: Blob) => void;
  onCancel: () => void;
}

export function ImageCropDialog({
  open,
  onOpenChange,
  file,
  type,
  onComplete,
  onCancel,
}: ImageCropDialogProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const isAvatar = type === "avatar";
  const aspect = isAvatar ? 1 : 4;
  const cropShape = isAvatar ? "round" : "rect";

  useEffect(() => {
    if (!file || !open) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    return () => URL.revokeObjectURL(url);
  }, [file, open]);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!imageUrl || !croppedAreaPixels) return;
    setLoading(true);
    try {
      const blob = isAvatar
        ? await getCroppedAvatarBlob(imageUrl, croppedAreaPixels)
        : await getCroppedBannerBlob(imageUrl, croppedAreaPixels);
      onComplete(blob);
      onOpenChange(false);
    } catch (e) {
      console.error("Crop failed", e);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    onCancel();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[90vw] sm:max-h-[85vh] flex flex-col gap-4"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle>
            {isAvatar ? "Crop avatar" : "Crop banner"}
          </DialogTitle>
        </DialogHeader>
        {imageUrl && (
          <div className="relative h-[50vh] w-full min-h-[280px] bg-muted rounded-lg overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={cropShape as "rect" | "round"}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}
        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!croppedAreaPixels || loading}
          >
            {loading ? "Cropping…" : "Crop & upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
