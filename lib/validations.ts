import { z } from "zod/v4";

export const signupSchema = z.object({
  volunteer_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100),
  volunteer_email: z.email("Please enter a valid email address"),
  volunteer_phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Phone must be in E.164 format (e.g. +15551234567)"
    ),
});

export const eventSchema = z.object({
  facility: z.string().min(1, "Facility name is required").max(200),
  description: z.string().max(2000).optional(),
  event_date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().optional(),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  loops_template_id: z.string().optional(),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
