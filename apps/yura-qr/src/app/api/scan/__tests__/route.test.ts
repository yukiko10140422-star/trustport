import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase
const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({ insert: mockInsert }));

vi.mock('@/lib/supabase', () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

// Mock Next.js request/response
class MockHeaders {
  private headers: Record<string, string>;
  constructor(init: Record<string, string> = {}) {
    this.headers = init;
  }
  get(name: string): string | null {
    return this.headers[name.toLowerCase()] ?? null;
  }
}

function createMockRequest(body: unknown, headers: Record<string, string> = {}): Request {
  const defaultHeaders = {
    'user-agent': 'TestAgent/1.0',
    referer: 'https://example.com',
    ...headers,
  };
  return {
    json: () => Promise.resolve(body),
    headers: new MockHeaders(defaultHeaders),
  } as unknown as Request;
}

// Import after mocks
import { POST } from '../route';
import { NextRequest } from 'next/server';

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom.mockReturnValue({ insert: mockInsert });
  mockInsert.mockResolvedValue({ error: null });
});

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('POST /api/scan', () => {
  it('returns success for valid QR scan', async () => {
    const req = createMockRequest({
      garment_id: VALID_UUID,
      scan_type: 'qr',
      locale: 'ja',
    });

    const res = await POST(req as unknown as NextRequest);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(res.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('scan_events');
  });

  it('returns success for valid NFC scan', async () => {
    const req = createMockRequest({
      garment_id: VALID_UUID,
      scan_type: 'nfc',
      locale: 'en',
    });

    const res = await POST(req as unknown as NextRequest);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('defaults scan_type to qr for unknown values', async () => {
    const req = createMockRequest({
      garment_id: VALID_UUID,
      scan_type: 'bluetooth',
      locale: 'ja',
    });

    await POST(req as unknown as NextRequest);

    const insertedData = mockInsert.mock.calls[0][0];
    expect(insertedData.scan_type).toBe('qr');
  });

  it('sets garment_id to null for invalid UUID', async () => {
    const req = createMockRequest({
      garment_id: 'not-a-uuid',
      scan_type: 'qr',
      locale: 'ja',
    });

    await POST(req as unknown as NextRequest);

    const insertedData = mockInsert.mock.calls[0][0];
    expect(insertedData.garment_id).toBeNull();
  });

  it('sets locale to null for invalid locale', async () => {
    const req = createMockRequest({
      garment_id: VALID_UUID,
      scan_type: 'qr',
      locale: 'fr',
    });

    await POST(req as unknown as NextRequest);

    const insertedData = mockInsert.mock.calls[0][0];
    expect(insertedData.locale).toBeNull();
  });

  it('truncates long user-agent to 500 chars', async () => {
    const longUA = 'A'.repeat(600);
    const req = createMockRequest(
      { garment_id: VALID_UUID, scan_type: 'qr', locale: 'ja' },
      { 'user-agent': longUA },
    );

    await POST(req as unknown as NextRequest);

    const insertedData = mockInsert.mock.calls[0][0];
    expect(insertedData.user_agent.length).toBe(500);
  });

  it('returns 500 when supabase insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'DB error' } });

    const req = createMockRequest({
      garment_id: VALID_UUID,
      scan_type: 'qr',
      locale: 'ja',
    });

    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(500);
  });

  it('returns 400 when request body is invalid JSON', async () => {
    const req = {
      json: () => Promise.reject(new Error('Invalid JSON')),
      headers: new MockHeaders({ 'user-agent': 'Test' }),
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('handles missing garment_id gracefully', async () => {
    const req = createMockRequest({
      scan_type: 'qr',
      locale: 'ja',
    });

    await POST(req as unknown as NextRequest);

    const insertedData = mockInsert.mock.calls[0][0];
    expect(insertedData.garment_id).toBeNull();
  });

  it('captures ip_country and ip_city from vercel headers', async () => {
    const req = createMockRequest(
      { garment_id: VALID_UUID, scan_type: 'qr', locale: 'ja' },
      { 'x-vercel-ip-country': 'JP', 'x-vercel-ip-city': 'Tokyo' },
    );

    await POST(req as unknown as NextRequest);

    const insertedData = mockInsert.mock.calls[0][0];
    expect(insertedData.ip_country).toBe('JP');
    expect(insertedData.ip_city).toBe('Tokyo');
  });
});
