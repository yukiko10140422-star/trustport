import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/api-auth';

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

export async function GET(req: NextRequest) {
  const auth = await getAuthSession();
  if (!auth?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = auth.accessToken;

  const { searchParams } = new URL(req.url);
  const timeMin = searchParams.get('timeMin') || new Date().toISOString();
  const timeMax = searchParams.get('timeMax') || new Date(Date.now() + 7 * 86400000).toISOString();

  const res = await fetch(
    `${CALENDAR_API}/calendars/primary/events?` +
    `timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
    `&singleEvents=true&orderBy=startTime&maxResults=20`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: 'Calendar API error', detail: err }, { status: res.status });
  }

  const data = await res.json();
  const events = (data.items || []).map((e: any) => ({
    id: e.id,
    title: e.summary || '(無題)',
    start: e.start?.dateTime || e.start?.date || '',
    end: e.end?.dateTime || e.end?.date || '',
    allDay: !e.start?.dateTime,
    location: e.location || '',
  }));

  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthSession();
  if (!auth?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = auth.accessToken;

  const body = await req.json();
  const { title, start, end, allDay } = body;

  if (!title || !start) {
    return NextResponse.json({ error: 'title and start required' }, { status: 400 });
  }

  const event: any = { summary: title };
  if (allDay) {
    event.start = { date: start };
    event.end = { date: end || start };
  } else {
    event.start = { dateTime: start, timeZone: 'Asia/Tokyo' };
    event.end = { dateTime: end || new Date(new Date(start).getTime() + 3600000).toISOString(), timeZone: 'Asia/Tokyo' };
  }

  const res = await fetch(`${CALENDAR_API}/calendars/primary/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: 'Failed to create event', detail: err }, { status: res.status });
  }

  const created = await res.json();
  return NextResponse.json({
    id: created.id,
    title: created.summary,
    start: created.start?.dateTime || created.start?.date,
  });
}
