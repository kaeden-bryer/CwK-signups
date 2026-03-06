"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelSignup } from "./actions";
import { Button } from "@/components/ui/button";

export function CancelButton({ signupId }: { signupId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleCancel() {
    setLoading(true);
    await cancelSignup(signupId);
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Are you sure?</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancel}
          disabled={loading}
        >
          {loading ? "Cancelling..." : "Yes, cancel"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirming(false)}
        >
          No, keep it
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
      Cancel Sign-Up
    </Button>
  );
}
