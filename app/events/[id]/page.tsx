import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { SignUpForm } from "./signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import type { Event } from "@/types/database.types";

export const revalidate = 0;

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

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const typedEvent = event as Event;

  const { count: confirmedCount } = await supabase
    .from("signups")
    .select("*", { count: "exact", head: true })
    .eq("event_id", id)
    .eq("status", "confirmed");

  const confirmed = confirmedCount ?? 0;
  const spotsLeft = typedEvent.capacity - confirmed;
  const isFull = spotsLeft <= 0;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultVolunteerName: string | null = null;
  let defaultVolunteerPhone: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .single();

    if (profile) {
      defaultVolunteerName = profile.full_name ?? null;
      defaultVolunteerPhone = profile.phone ?? null;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{typedEvent.facility}</CardTitle>
              {typedEvent.description && (
                <CardDescription className="mt-2">
                  {typedEvent.description}
                </CardDescription>
              )}
            </div>
            {isFull ? (
              <Badge variant="secondary" className="text-sm">
                Full
              </Badge>
            ) : (
              <Badge variant="default" className="text-sm">
                {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(typedEvent.event_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatTime(typedEvent.start_time)}
                {typedEvent.end_time &&
                  ` – ${formatTime(typedEvent.end_time)}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{typedEvent.facility}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {confirmed}/{typedEvent.capacity} signed up
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        {isFull ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-lg font-medium">This performance is full</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back later in case spots open up from cancellations.
              </p>
            </CardContent>
          </Card>
        ) : (
          <SignUpForm
            eventId={typedEvent.id}
            userId={user?.id ?? null}
            userEmail={user?.email ?? null}
            defaultVolunteerName={defaultVolunteerName}
            defaultVolunteerPhone={defaultVolunteerPhone}
          />
        )}
      </div>
    </div>
  );
}
