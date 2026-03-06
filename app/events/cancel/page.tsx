import { createServiceClient } from "@/lib/supabase/server";
import { GuestCancelForm } from "./cancel-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Clock, MapPin, AlertTriangle } from "lucide-react";

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

export default async function GuestCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">Invalid cancellation link</h1>
        <p className="mt-2 text-muted-foreground">
          This link is missing a cancellation token.
        </p>
      </div>
    );
  }

  const supabase = await createServiceClient();

  const { data: signup } = await supabase
    .from("signups")
    .select("*, events(*)")
    .eq("cancel_token", token)
    .single();

  if (!signup) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">Sign-up not found</h1>
        <p className="mt-2 text-muted-foreground">
          This cancellation link is invalid or has already been used.
        </p>
      </div>
    );
  }

  if (signup.status === "cancelled") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Already cancelled</h1>
        <p className="mt-2 text-muted-foreground">
          This sign-up has already been cancelled.
        </p>
      </div>
    );
  }

  const event = signup.events;

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Cancel your sign-up</CardTitle>
          <CardDescription>
            You are about to cancel your sign-up for the following event:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">{event.facility}</h3>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(event.event_date)}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatTime(event.start_time)}
                {event.end_time && ` – ${formatTime(event.end_time)}`}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.facility}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Signed up as: <strong>{signup.volunteer_name}</strong> (
            {signup.volunteer_email})
          </p>
          <GuestCancelForm token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
