import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CancelButton } from "./cancel-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { SignupWithEvent } from "@/types/database.types";

export const revalidate = 0;

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function MySignupsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/my-signups");

  const { data: signups } = await supabase
    .from("signups")
    .select("*, events(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const typedSignups = (signups as SignupWithEvent[] | null) ?? [];

  const upcoming = typedSignups.filter(
    (s) =>
      s.status === "confirmed" && s.events.event_date >= new Date().toISOString().split("T")[0]
  );
  const past = typedSignups.filter(
    (s) =>
      s.status === "cancelled" || s.events.event_date < new Date().toISOString().split("T")[0]
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">My Sign-Ups</h1>
      <p className="mb-8 text-muted-foreground">
        Manage your volunteer commitments.
      </p>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              You don&apos;t have any upcoming sign-ups.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcoming.map((signup) => (
              <Card key={signup.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle>{signup.events.facility}</CardTitle>
                    <Badge variant="default">Confirmed</Badge>
                  </div>
                  {signup.events.description && (
                    <CardDescription>
                      {signup.events.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(signup.events.event_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(signup.events.start_time)}
                      {signup.events.end_time &&
                        ` – ${formatTime(signup.events.end_time)}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {signup.events.facility}
                    </span>
                  </div>
                  <div className="mt-4">
                    <CancelButton signupId={signup.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Past & Cancelled</h2>
          <div className="grid gap-4">
            {past.map((signup) => (
              <Card key={signup.id} className="opacity-60">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle>{signup.events.facility}</CardTitle>
                    <Badge
                      variant={
                        signup.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {signup.status === "cancelled" ? "Cancelled" : "Past"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(signup.events.event_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(signup.events.start_time)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
