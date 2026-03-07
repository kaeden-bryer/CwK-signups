"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "./actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this performance? This cannot be undone.")) {
      return;
    }
    setLoading(true);
    await deleteEvent(eventId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
