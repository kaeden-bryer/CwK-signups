import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/EventForm";
import { updateEvent } from "../actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { Event, Signup } from "@/types/database.types";

export const revalidate = 0;

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const typedEvent = event as Event;

  const { data: signups } = await supabase
    .from("signups")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  const typedSignups = (signups as Signup[] | null) ?? [];

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateEvent(id, formData);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Edit Event</h1>
        <EventForm
          event={typedEvent}
          action={handleUpdate}
          submitLabel="Save Changes"
        />
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>
            Volunteers ({typedSignups.filter((s) => s.status === "confirmed").length}{" "}
            confirmed)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Signed Up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typedSignups.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No sign-ups yet.
                  </TableCell>
                </TableRow>
              ) : (
                typedSignups.map((signup) => (
                  <TableRow key={signup.id}>
                    <TableCell>{signup.volunteer_name}</TableCell>
                    <TableCell>{signup.volunteer_email}</TableCell>
                    <TableCell>{signup.volunteer_phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          signup.status === "confirmed"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {signup.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(signup.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
