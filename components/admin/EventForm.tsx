"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Event } from "@/types/database.types";

interface EventFormProps {
  event?: Event;
  action: (formData: FormData) => Promise<{ error?: string } | undefined>;
  submitLabel: string;
}

export function EventForm({ event, action, submitLabel }: EventFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event ? "Edit Event" : "Create Event"}</CardTitle>
        <CardDescription>
          {event
            ? "Update the event details below."
            : "Fill in the details for the new volunteer event."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facility">Facility / Location</Label>
            <Input
              id="facility"
              name="facility"
              defaultValue={event?.facility ?? ""}
              placeholder="Community Center"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              name="description"
              defaultValue={event?.description ?? ""}
              placeholder="Brief description of the volunteer opportunity"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event_date">Date</Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                defaultValue={event?.event_date ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                defaultValue={event?.capacity ?? ""}
                placeholder="10"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                defaultValue={event?.start_time?.slice(0, 5) ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time (optional)</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                defaultValue={event?.end_time?.slice(0, 5) ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loops_template_id">
              Loops Template ID (optional)
            </Label>
            <Input
              id="loops_template_id"
              name="loops_template_id"
              defaultValue={event?.loops_template_id ?? ""}
              placeholder="clxxxxxxxxxxxxxx"
            />
            <p className="text-xs text-muted-foreground">
              The transactional email template ID from Loops.so. Leave blank to
              skip confirmation emails.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/events")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
