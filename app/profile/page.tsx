import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import type { Profile } from "@/types/database.types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/profile");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const serviceClient = await createServiceClient();
    const username =
      user.user_metadata?.username ?? `user_${user.id.slice(0, 8)}`;
    const { data: created } = await serviceClient
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: user.user_metadata?.full_name ?? "",
          email: user.email!,
          username,
          avatar_url: "/defaults/avatar.svg",
          banner_url: "/defaults/banner.svg",
          is_admin: false,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    profile = created;
  }

  if (!profile) {
    redirect("/login?redirectTo=/profile");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Your Profile</h1>
      <ProfileForm profile={profile as Profile} />
    </div>
  );
}
