interface SendConfirmationEmailParams {
  to: string;
  transactionalId: string;
  volunteerName: string;
  facility: string;
  eventDate: string;
  startTime: string;
  cancelUrl: string;
}

export async function sendConfirmationEmail({
  to,
  transactionalId,
  volunteerName,
  facility,
  eventDate,
  startTime,
  cancelUrl,
}: SendConfirmationEmailParams) {
  const res = await fetch("https://app.loops.so/api/v2/transactional", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transactionalId,
      email: to,
      dataVariables: {
        volunteerName,
        facility,
        eventDate,
        startTime,
        cancelUrl,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Loops API error (${res.status}): ${body}`);
  }

  return res.json();
}

export async function fetchLoopsTemplates(): Promise<
  { id: string; name: string }[]
> {
  const res = await fetch("https://app.loops.so/api/v2/transactional", {
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Loops templates: ${res.status}`);
  }

  return res.json();
}
