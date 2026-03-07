"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod/v4";

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
