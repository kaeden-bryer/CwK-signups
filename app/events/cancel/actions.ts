"use server";

import { createServiceClient } from "@/lib/supabase/server";

export async function cancelWithToken(token: string) {
  const supabase = await createServiceClient();

  const { data: signup } = await supabase
    .from("signups")
    .select("id, status")
    .eq("cancel_token", token)
    .single();

  if (!signup) {
    return { error: "Sign-up not found." };
  }

  if (signup.status === "cancelled") {
    return { error: "This sign-up is already cancelled." };
  }

  const { error } = await supabase
    .from("signups")
    .update({ status: "cancelled" })
    .eq("id", signup.id);

  if (error) {
    return { error: "Failed to cancel. Please try again." };
  }

  return { success: true };
}
