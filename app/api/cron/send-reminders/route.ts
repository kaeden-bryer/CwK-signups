import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendReminder } from "@/lib/utils/sms";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: signups, error } = await supabase
    .from("signups")
    .select("id, volunteer_name, volunteer_phone, events(facility, event_date, start_time)")
    .eq("status", "confirmed")
    .eq("reminder_sent", false)
    .eq("events.event_date", today);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const relevantSignups = (signups ?? []).filter(
    (s: any) => s.events !== null
  );

  let sent = 0;
  let failed = 0;

  for (const signup of relevantSignups) {
    const event = signup.events as any;
    const formatTime = (t: string) => {
      const [h, m] = t.split(":");
      const d = new Date();
      d.setHours(parseInt(h), parseInt(m));
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    };

    const message = `Hi ${signup.volunteer_name}! Reminder: You're volunteering at ${event.facility} today at ${formatTime(event.start_time)}. Thank you for making a difference!`;

    try {
      await sendReminder(signup.volunteer_phone, message);
      await supabase
        .from("signups")
        .update({ reminder_sent: true })
        .eq("id", signup.id);
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({
    date: today,
    total: relevantSignups.length,
    sent,
    failed,
  });
}
