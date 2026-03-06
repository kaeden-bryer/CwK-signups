import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
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
import { InviteForm } from "./invite-form";
import type { AdminInvite } from "@/types/database.types";

export const revalidate = 0;

export default async function AdminInvitesPage() {
  const supabase = await createClient();

  const { data: invites } = await supabase
    .from("admin_invites")
    .select("*")
    .order("created_at", { ascending: false });

  const typedInvites = (invites as AdminInvite[] | null) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invite Admins</h1>
        <p className="text-sm text-muted-foreground">
          Invite people by email. When they sign up via magic link, they will
          automatically be granted admin access.
        </p>
      </div>

      <InviteForm />

      <Card>
        <CardHeader>
          <CardTitle>Sent Invites</CardTitle>
          <CardDescription>
            People you have invited to become admins.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typedInvites.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No invites sent yet.
                  </TableCell>
                </TableRow>
              ) : (
                typedInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">
                      {invite.email}
                    </TableCell>
                    <TableCell>
                      {invite.accepted ? (
                        <Badge variant="default">Accepted</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invite.created_at).toLocaleDateString()}
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
