"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validations";
import { sendConfirmationEmail } from "@/lib/utils/email";

export async function signUpForEvent(formData: FormData) {
  const raw = {
    volunteer_name: formData.get("volunteer_name") as string,
    volunteer_email: formData.get("volunteer_email") as string,
    volunteer_phone: formData.get("volunteer_phone") as string,
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const eventId = formData.get("event_id") as string;
  const userId = (formData.get("user_id") as string) || null;

  const supabase = await createServiceClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    return { error: "Event not found." };
  }

  const { count } = await supabase
    .from("signups")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "confirmed");

  if ((count ?? 0) >= event.capacity) {
    return { error: "Sorry, this event is now full." };
  }

  const { data: signup, error: insertError } = await supabase
    .from("signups")
    .insert({
      event_id: eventId,
      user_id: userId,
      volunteer_name: parsed.data.volunteer_name,
      volunteer_email: parsed.data.volunteer_email,
      volunteer_phone: parsed.data.volunteer_phone,
      status: "confirmed",
    })
    .select("cancel_token")
    .single();

  if (insertError) {
    return { error: "Failed to sign up. Please try again." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cancelUrl = `${appUrl}/events/cancel?token=${signup.cancel_token}`;

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m));
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  if (event.loops_template_id) {
    try {
      await sendConfirmationEmail({
        to: parsed.data.volunteer_email,
        transactionalId: event.loops_template_id,
        volunteerName: parsed.data.volunteer_name,
        facility: event.facility,
        eventDate: new Date(event.event_date + "T00:00:00").toLocaleDateString(
          "en-US",
          { weekday: "long", month: "long", day: "numeric", year: "numeric" }
        ),
        startTime: formatTime(event.start_time),
        cancelUrl,
      });
    } catch {
      // Email failure shouldn't block the signup
    }
  }

  return { success: true, cancelUrl };
}
