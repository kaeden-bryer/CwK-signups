import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DeleteEventButton } from "./delete-button";
import type { Event } from "@/types/database.types";

export const revalidate = 0;

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":");
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m));
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default async function AdminEventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  const typedEvents = (events as Event[] | null) ?? [];

  let signupCounts: Record<string, number> = {};
  if (typedEvents.length > 0) {
    const ids = typedEvents.map((e) => e.id);
    const { data: counts } = await supabase
      .from("signups")
      .select("event_id")
      .in("event_id", ids)
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage volunteer events.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/events/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Signups</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typedEvents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No events yet. Create your first one!
                  </TableCell>
                </TableRow>
              ) : (
                typedEvents.map((event) => {
                  const confirmed = signupCounts[event.id] || 0;
                  const isPast = event.event_date < today;
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        {event.facility}
                      </TableCell>
                      <TableCell>{formatDate(event.event_date)}</TableCell>
                      <TableCell>{formatTime(event.start_time)}</TableCell>
                      <TableCell>
                        {confirmed}/{event.capacity}
                      </TableCell>
                      <TableCell>
                        {isPast ? (
                          <Badge variant="secondary">Past</Badge>
                        ) : confirmed >= event.capacity ? (
                          <Badge variant="destructive">Full</Badge>
                        ) : (
                          <Badge variant="default">Open</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/admin/events/${event.id}`} />}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DeleteEventButton eventId={event.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
