import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Users, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/admin/events");

  let { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const serviceClient = await createServiceClient();
    const username =
      user.user_metadata?.username ?? `user_${user.id.slice(0, 8)}`;

    const isInvitedAdmin = await serviceClient
      .from("admin_invites")
      .select("id")
      .eq("email", user.email!)
      .eq("accepted", false)
      .maybeSingle()
      .then((r) => !!r.data);

    if (isInvitedAdmin) {
      await serviceClient
        .from("admin_invites")
        .update({ accepted: true })
        .eq("email", user.email!)
        .eq("accepted", false);
    }

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
          is_admin: isInvitedAdmin,
        },
        { onConflict: "id" }
      )
      .select("is_admin")
      .single();

    profile = created;
  }

  if (!profile?.is_admin) redirect("/events");

  const navItems = [
    { href: "/admin/events", label: "Events", icon: CalendarDays },
    { href: "/admin/volunteers", label: "Volunteers", icon: Users },
    { href: "/admin/invites", label: "Invite Admins", icon: UserPlus },
  ];

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
      <aside className="hidden w-52 shrink-0 md:block">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Admin
        </h2>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
