import { createClient } from "@/lib/supabase/server";
import { SignUpForm } from "./signup-form";

export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialFullName: string | null = null;
  let initialPhone: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .single();

    if (profile) {
      initialFullName = profile.full_name ?? null;
      initialPhone = profile.phone ?? null;
    }
  }

  return (
    <SignUpForm
      initialFullName={initialFullName}
      initialPhone={initialPhone}
    />
  );
}
