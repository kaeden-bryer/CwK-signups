"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

type Props = { isLoggedIn: boolean };

export function HomeAuthButton({ isLoggedIn }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (isLoggedIn) {
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setOpen(true)}
            className="border-red-200 bg-red-50 text-red-700 shadow-sm hover:bg-red-100 hover:text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/50"
          >
            Log out
          </Button>
          <DialogContent showCloseButton={true}>
            <DialogHeader>
              <DialogTitle>Log out?</DialogTitle>
              <DialogDescription>
                Are you sure you want to log out? You can sign in again anytime.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton={false}>
              <DialogClose render={<Button variant="outline" size="default" />}>
                Cancel
              </DialogClose>
              <Button
                onClick={handleLogOut}
                className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/50"
              >
                Log out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Button variant="outline" size="lg" nativeButton={false} render={<Link href="/login" />}>
      Sign In
    </Button>
  );
}
