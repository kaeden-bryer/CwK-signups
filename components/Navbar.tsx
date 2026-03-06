import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "./UserNav";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export async function Navbar() {
  let user = null;
  let isAdmin = false;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.is_admin ?? false;
    }
  } catch {
    // Supabase not configured yet — render as unauthenticated
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Heart className="h-5 w-5 text-primary" />
            <span>Volunteer Hub</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link
              href="/events"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Events
            </Link>
            {user && (
              <Link
                href="/my-signups"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                My Sign-Ups
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin/events"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div>
          {user ? (
            <UserNav email={user.email ?? ""} isAdmin={isAdmin} />
          ) : (
            <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
