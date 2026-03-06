"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function cancelSignup(signupId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("signups")
    .update({ status: "cancelled" })
    .eq("id", signupId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Failed to cancel sign-up.");
  }
}
