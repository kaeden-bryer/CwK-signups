import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import type { Event } from "@/types/database.types";

export const revalidate = 0;

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  const eventIds = (events as Event[] | null)?.map((e) => e.id) ?? [];

  let signupCounts: Record<string, number> = {};
  if (eventIds.length > 0) {
    const { data: counts } = await supabase
      .from("signups")
      .select("event_id")
      .in("event_id", eventIds)
      .eq("status", "confirmed");

    if (counts) {
      signupCounts = counts.reduce(
        (acc, row) => {
          acc[row.event_id] = (acc[row.event_id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Upcoming Volunteer Events
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find an opportunity that fits your schedule and sign up to make a
          difference.
        </p>
      </div>

      {!events || events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold">No upcoming events</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back soon for new volunteer opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {(events as Event[]).map((event) => {
            const confirmed = signupCounts[event.id] || 0;
            const spotsLeft = event.capacity - confirmed;
            const isFull = spotsLeft <= 0;

            return (
              <Card key={event.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {event.facility}
                      </CardTitle>
                      {event.description && (
                        <CardDescription className="mt-1">
                          {event.description}
                        </CardDescription>
                      )}
                    </div>
                    {isFull ? (
                      <Badge variant="secondary">Full</Badge>
                    ) : (
                      <Badge variant="default">
                        {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(event.event_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(event.start_time)}
                      {event.end_time && ` – ${formatTime(event.end_time)}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.facility}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {confirmed}/{event.capacity} signed up
                    </span>
                  </div>
                  <div className="mt-4">
                    {isFull ? (
                      <Button disabled>Event Full</Button>
                    ) : (
                      <Button nativeButton={false} render={<Link href={`/events/${event.id}`} />}>
                        View &amp; Sign Up
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
