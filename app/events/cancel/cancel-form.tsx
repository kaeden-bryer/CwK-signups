"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelWithToken } from "./actions";
import { Button } from "@/components/ui/button";

export function GuestCancelForm({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    const result = await cancelWithToken(token);
    if (result.error) {
      setError(result.error);
    } else {
      setDone(true);
    }
    setLoading(false);
    router.refresh();
  }

  if (done) {
    return (
      <p className="text-center text-sm font-medium text-success">
        Your sign-up has been cancelled successfully.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleCancel}
        disabled={loading}
      >
        {loading ? "Cancelling..." : "Confirm Cancellation"}
      </Button>
    </div>
  );
}
