"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";
import type { Profile } from "@/types/database.types";
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
import { toast } from "sonner";
import Image from "next/image";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
    } else {
      toast.success("Profile updated");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Banner & Avatar Display */}
      <Card className="overflow-hidden">
        <div className="relative">
          <Image
            src={profile.banner_url}
            alt="Profile banner"
            width={1200}
            height={300}
            className="h-32 w-full object-cover sm:h-48"
            priority
          />
          <div className="absolute -bottom-10 left-6">
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={80}
              height={80}
              className="rounded-full border-4 border-background"
            />
          </div>
        </div>
        <div className="px-6 pb-4 pt-14">
          <h2 className="text-xl font-semibold">{profile.username}</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={profile.username}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Jane Doe"
                defaultValue={profile.full_name ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+15551234567"
                defaultValue={profile.phone ?? ""}
              />
              <p className="text-xs text-muted-foreground">
                E.164 format (e.g. +15551234567). Used for SMS reminders.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
