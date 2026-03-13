import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_LOCALES = ['ja', 'en'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const garmentId = typeof body.garment_id === 'string' && UUID_RE.test(body.garment_id)
      ? body.garment_id
      : null;

    const locale = typeof body.locale === 'string' && ALLOWED_LOCALES.includes(body.locale)
      ? body.locale
      : null;

    const scanEvent = {
      garment_id: garmentId,
      scan_type: body.scan_type === 'nfc' ? 'nfc' : 'qr',
      user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
      referrer: request.headers.get('referer')?.slice(0, 500) ?? null,
      locale,
      ip_country: request.headers.get('x-vercel-ip-country') ?? null,
      ip_city: request.headers.get('x-vercel-ip-city') ?? null,
    };

    const { error } = await supabase.from('scan_events').insert(scanEvent);

    if (error) {
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
