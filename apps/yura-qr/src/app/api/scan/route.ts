import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const scanEvent = {
      garment_id: typeof body.garment_id === 'string' ? body.garment_id : null,
      scan_type: body.scan_type === 'nfc' ? 'nfc' : 'qr',
      user_agent: request.headers.get('user-agent') ?? null,
      referrer: request.headers.get('referer') ?? null,
      locale: typeof body.locale === 'string' ? body.locale : null,
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
