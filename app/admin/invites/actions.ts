"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function sendAdminInvite(email: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "You do not have admin permissions." };
  }

  const { data: existing } = await supabase
    .from("admin_invites")
    .select("id")
    .eq("email", email.toLowerCase())
    .eq("accepted", false)
    .single();

  if (existing) {
    return { error: "This email already has a pending invite." };
  }

  const { error } = await supabase.from("admin_invites").insert({
    email: email.toLowerCase(),
    invited_by: user.id,
  });

  if (error) {
    return { error: "Failed to send invite." };
  }

  return { success: true };
}
