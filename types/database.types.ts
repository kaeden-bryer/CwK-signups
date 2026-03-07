export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  username: string;
  phone: string | null;
  avatar_url: string;
  banner_url: string;
  is_admin: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  facility: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  capacity: number;
  loops_template_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Signup {
  id: string;
  event_id: string;
  user_id: string | null;
  volunteer_name: string;
  volunteer_email: string;
  volunteer_phone: string;
  status: "confirmed" | "cancelled";
  cancel_token: string;
  reminder_sent: boolean;
  created_at: string;
}

export interface AdminInvite {
  id: string;
  email: string;
  invited_by: string | null;
  accepted: boolean;
  created_at: string;
}

export interface EventWithSignupCount extends Event {
  confirmed_count: number;
}

export interface SignupWithEvent extends Signup {
  events: Event;
}
