"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendAdminInvite } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, CheckCircle } from "lucide-react";

export function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await sendAdminInvite(email);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setEmail("");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            <UserPlus className="mr-2 h-4 w-4" />
            {loading ? "Sending..." : "Send Invite"}
          </Button>
        </form>
        {success && (
          <p className="mt-3 flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Invite sent! They will become an admin when they sign up.
          </p>
        )}
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
