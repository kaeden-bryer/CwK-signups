import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { HomeAuthButton } from "@/components/HomeAuthButton";
import { Piano, CalendarDays, Users, Bell } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const isLoggedIn = !!data.user;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center md:py-32">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Piano className="h-8 w-8 text-primary" />
        </div>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
          Make a difference with your music
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          See upcoming performances, sign up in seconds and get email and text reminders
        </p>
        <div className="flex gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/events" />}>
            Browse Performances
          </Button>
          <HomeAuthButton isLoggedIn={isLoggedIn} />
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/40 px-4 py-16">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Easy Sign-Up</h3>
            <p className="text-sm text-muted-foreground">
              Find a performance that fits your schedule and register with just your
              name, email, and phone number.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">SMS Reminders</h3>
            <p className="text-sm text-muted-foreground">
              Get a text message reminder on the day of your shift so you show
              up prepared and on time.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Flexible</h3>
            <p className="text-sm text-muted-foreground">
              Sign up as a guest or create an account to manage all your
              volunteer commitments in one place.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
