"use server";

import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod/v4";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE_MB = 1;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const updateProfileSchema = z.object({
  full_name: z.string().max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Phone must be in E.164 format (e.g. +15551234567)")
    .or(z.literal(""))
    .optional(),
});

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const raw = {
    full_name: formData.get("full_name") as string,
    phone: (formData.get("phone") as string) || "",
  };

  const result = updateProfileSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const updates: Record<string, string | null> = {
    full_name: result.data.full_name || null,
    phone: result.data.phone || null,
  };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function uploadProfileImage(
  type: "avatar" | "banner",
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "No file provided" };
  }

  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return { error: "Invalid file type. Use JPEG, PNG, or WebP." };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { error: `File must be under ${MAX_SIZE_MB} MB` };
  }

  const token = process.env.CWK_READ_WRITE_TOKEN;
  if (!token) {
    return { error: "Blob storage is not configured (CWK_READ_WRITE_TOKEN)." };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const uuid = randomUUID();
  const pathname = `profiles/${user.id}/${type}/${uuid}.${ext}`;

  let blob: { url: string };
  try {
    blob = await put(pathname, file, {
      access: "public",
      token,
    });
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to upload image",
    };
  }

  const column = type === "avatar" ? "avatar_url" : "banner_url";
  const service = await createServiceClient();
  const { error } = await service
    .from("profiles")
    .update({ [column]: blob.url })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, url: blob.url };
}
