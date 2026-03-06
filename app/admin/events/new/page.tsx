import { EventForm } from "@/components/admin/EventForm";
import { createEvent } from "../actions";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Create New Event
      </h1>
      <EventForm action={createEvent} submitLabel="Create Event" />
    </div>
  );
}
