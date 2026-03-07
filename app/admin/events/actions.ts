"use server";

import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validations";
import { redirect } from "next/navigation";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = {
    facility: formData.get("facility") as string,
    description: (formData.get("description") as string) || undefined,
    event_date: formData.get("event_date") as string,
    start_time: formData.get("start_time") as string,
    end_time: (formData.get("end_time") as string) || undefined,
    capacity: formData.get("capacity") as string,
    loops_template_id:
      (formData.get("loops_template_id") as string) || undefined,
  };

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("events").insert({
    ...parsed.data,
    end_time: parsed.data.end_time || null,
    loops_template_id: parsed.data.loops_template_id || null,
    description: parsed.data.description || null,
    created_by: user.id,
  });

  if (error) {
    return { error: "Failed to create event." };
  }

  redirect("/admin/events");
}

export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = {
    facility: formData.get("facility") as string,
    description: (formData.get("description") as string) || undefined,
    event_date: formData.get("event_date") as string,
    start_time: formData.get("start_time") as string,
    end_time: (formData.get("end_time") as string) || undefined,
    capacity: formData.get("capacity") as string,
    loops_template_id:
      (formData.get("loops_template_id") as string) || undefined,
  };

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("events")
    .update({
      ...parsed.data,
      end_time: parsed.data.end_time || null,
      loops_template_id: parsed.data.loops_template_id || null,
      description: parsed.data.description || null,
    })
    .eq("id", eventId);

  if (error) {
    return { error: "Failed to update event." };
  }

  redirect("/admin/events");
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    throw new Error("Failed to delete event.");
  }
}

export async function cancelSignupAsAdmin(signupId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("signups")
    .update({ status: "cancelled" })
    .eq("id", signupId);

  if (error) {
    throw new Error("Failed to cancel sign-up.");
  }
}
