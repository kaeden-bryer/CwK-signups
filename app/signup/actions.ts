"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validations";

export async function createAccount(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = signUpSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createServiceClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", raw.username)
    .limit(1);

  if (existing && existing.length > 0) {
    return { error: "This username is already taken" };
  }

  const { error } = await supabase.auth.admin.createUser({
    email: raw.email,
    password: raw.password,
    email_confirm: true,
    user_metadata: { username: raw.username },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
