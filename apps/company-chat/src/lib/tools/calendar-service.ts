const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
}

export async function listEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string,
): Promise<CalendarEvent[]> {
  const res = await fetch(
    `${CALENDAR_API}/calendars/primary/events?` +
      `timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
      `&singleEvents=true&orderBy=startTime&maxResults=20`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Calendar API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return (data.items || []).map((e: Record<string, unknown>) => ({
    id: e.id,
    title: (e.summary as string) || '(無題)',
    start: (e.start as Record<string, string>)?.dateTime || (e.start as Record<string, string>)?.date || '',
    end: (e.end as Record<string, string>)?.dateTime || (e.end as Record<string, string>)?.date || '',
    allDay: !(e.start as Record<string, string>)?.dateTime,
    location: (e.location as string) || '',
  }));
}

export async function createEvent(
  accessToken: string,
  params: { title: string; start: string; end?: string; allDay?: boolean },
): Promise<{ id: string; title: string; start: string }> {
  const event: Record<string, unknown> = { summary: params.title };

  if (params.allDay) {
    event.start = { date: params.start };
    event.end = { date: params.end || params.start };
  } else {
    event.start = { dateTime: params.start, timeZone: 'Asia/Tokyo' };
    event.end = {
      dateTime: params.end || new Date(new Date(params.start).getTime() + 3600000).toISOString(),
      timeZone: 'Asia/Tokyo',
    };
  }

  const res = await fetch(`${CALENDAR_API}/calendars/primary/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create event (${res.status}): ${err}`);
  }

  const created = await res.json();
  return {
    id: created.id,
    title: created.summary,
    start: created.start?.dateTime || created.start?.date,
  };
}
