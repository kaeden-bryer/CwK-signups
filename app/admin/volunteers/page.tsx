import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Signup } from "@/types/database.types";

export const revalidate = 0;

interface VolunteerSummary {
  email: string;
  name: string;
  phone: string;
  total: number;
  confirmed: number;
  cancelled: number;
}

export default async function AdminVolunteersPage() {
  const supabase = await createClient();

  const { data: signups } = await supabase
    .from("signups")
    .select("volunteer_name, volunteer_email, volunteer_phone, status")
    .order("created_at", { ascending: false });

  const typedSignups = (signups as Pick<
    Signup,
    "volunteer_name" | "volunteer_email" | "volunteer_phone" | "status"
  >[] | null) ?? [];

  const volunteerMap = new Map<string, VolunteerSummary>();
  for (const s of typedSignups) {
    const existing = volunteerMap.get(s.volunteer_email);
    if (existing) {
      existing.total++;
      if (s.status === "confirmed") existing.confirmed++;
      else existing.cancelled++;
    } else {
      volunteerMap.set(s.volunteer_email, {
        email: s.volunteer_email,
        name: s.volunteer_name,
        phone: s.volunteer_phone,
        total: 1,
        confirmed: s.status === "confirmed" ? 1 : 0,
        cancelled: s.status === "cancelled" ? 1 : 0,
      });
    }
  }

  const volunteers = Array.from(volunteerMap.values()).sort(
    (a, b) => b.total - a.total
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Volunteers</h1>
        <p className="text-sm text-muted-foreground">
          All volunteers who have signed up, deduplicated by email.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Sign-Ups</TableHead>
                <TableHead>Confirmed</TableHead>
                <TableHead>Cancelled</TableHead>
                <TableHead>Cancel Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volunteers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No volunteers yet.
                  </TableCell>
                </TableRow>
              ) : (
                volunteers.map((v) => (
                  <TableRow key={v.email}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.email}</TableCell>
                    <TableCell>{v.phone}</TableCell>
                    <TableCell>{v.total}</TableCell>
                    <TableCell>{v.confirmed}</TableCell>
                    <TableCell>{v.cancelled}</TableCell>
                    <TableCell>
                      {v.total > 0
                        ? `${Math.round((v.cancelled / v.total) * 100)}%`
                        : "0%"}
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
