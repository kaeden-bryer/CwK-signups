"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpForEvent } from "./actions";
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
import { CheckCircle } from "lucide-react";

interface SignUpFormProps {
  eventId: string;
  userId: string | null;
  userEmail: string | null;
}

export function SignUpForm({ eventId, userId, userEmail }: SignUpFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cancelUrl, setCancelUrl] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await signUpForEvent(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setCancelUrl(result.cancelUrl ?? null);
      setLoading(false);
      router.refresh();
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">You&apos;re signed up!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              A confirmation email has been sent. You&apos;ll also receive an
              SMS reminder on the day of the event.
            </p>
          </div>
          {cancelUrl && !userId && (
            <p className="text-xs text-muted-foreground">
              Bookmark your{" "}
              <a href={cancelUrl} className="underline">
                cancellation link
              </a>{" "}
              in case you need to cancel.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Fill out the form below to reserve your spot.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="event_id" value={eventId} />
          {userId && <input type="hidden" name="user_id" value={userId} />}

          <div className="space-y-2">
            <Label htmlFor="volunteer_name">Full name</Label>
            <Input
              id="volunteer_name"
              name="volunteer_name"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="volunteer_email">Email</Label>
            <Input
              id="volunteer_email"
              name="volunteer_email"
              type="email"
              placeholder="jane@example.com"
              defaultValue={userEmail ?? ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="volunteer_phone">Phone number</Label>
            <Input
              id="volunteer_phone"
              name="volunteer_phone"
              type="tel"
              placeholder="+15551234567"
              required
            />
            <p className="text-xs text-muted-foreground">
              E.164 format (e.g. +15551234567). Used for SMS reminders.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing up..." : "Confirm Sign-Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
