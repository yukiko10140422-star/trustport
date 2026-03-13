import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase before importing queries
const mockMaybeSingle = vi.fn();
const mockOrder = vi.fn(() => ({ data: [], error: null }));
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle, order: mockOrder }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockInsert = vi.fn(() => ({ error: null }));
const mockFrom = vi.fn(() => ({ select: mockSelect, insert: mockInsert }));

vi.mock('../supabase', () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

import { getGarmentBySku, getBrandContent, getLocationMemorial } from '../queries';

beforeEach(() => {
  vi.clearAllMocks();
  // Reset default chain behaviors
  mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle, order: mockOrder });
  mockOrder.mockReturnValue({ data: [], error: null });
});

describe('getGarmentBySku', () => {
  it('returns null when garment not found', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await getGarmentBySku('NONEXISTENT');
    expect(result).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith('garments');
  });

  it('returns null when supabase returns error', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    const result = await getGarmentBySku('SKU-001');
    expect(result).toBeNull();
  });

  it('returns garment with relations when found', async () => {
    const garment = {
      id: 'g1',
      sku: 'SKU-001',
      collection_id: 'c1',
      location_id: 'l1',
    };

    // First call: garments query
    // Subsequent calls: collections, locations, manufacturing_info, photos, testimonies
    let callCount = 0;
    mockMaybeSingle.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ data: garment, error: null });
      if (callCount === 2) return Promise.resolve({ data: { id: 'c1', name: 'Collection' }, error: null });
      if (callCount === 3) return Promise.resolve({ data: { id: 'l1', name: 'Location' }, error: null });
      if (callCount === 4) return Promise.resolve({ data: { id: 'm1', garment_id: 'g1' }, error: null });
      return Promise.resolve({ data: null, error: null });
    });

    const result = await getGarmentBySku('SKU-001');
    expect(result).not.toBeNull();
    expect(result?.collection).toEqual({ id: 'c1', name: 'Collection' });
    expect(result?.location).toBeTruthy();
  });

  it('handles garment without collection_id and location_id', async () => {
    const garment = {
      id: 'g2',
      sku: 'SKU-002',
      collection_id: null,
      location_id: null,
    };

    let callCount = 0;
    mockMaybeSingle.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ data: garment, error: null });
      // manufacturing_info
      return Promise.resolve({ data: null, error: null });
    });

    const result = await getGarmentBySku('SKU-002');
    expect(result).not.toBeNull();
    expect(result?.collection).toBeNull();
    expect(result?.location).toBeNull();
  });

  it('returns null on exception', async () => {
    mockMaybeSingle.mockRejectedValue(new Error('Network error'));
    const result = await getGarmentBySku('SKU-ERR');
    expect(result).toBeNull();
  });
});

describe('getBrandContent', () => {
  it('returns brand content when found', async () => {
    const content = { id: 'b1', slug: 'about', body: 'About us' };
    mockMaybeSingle.mockResolvedValue({ data: content, error: null });
    const result = await getBrandContent('about');
    expect(result).toEqual(content);
  });

  it('returns null when not found', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await getBrandContent('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null on error', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'error' } });
    const result = await getBrandContent('broken');
    expect(result).toBeNull();
  });

  it('returns null on exception', async () => {
    mockMaybeSingle.mockRejectedValue(new Error('fail'));
    const result = await getBrandContent('error');
    expect(result).toBeNull();
  });
});

describe('getLocationMemorial', () => {
  it('returns null when location not found', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await getLocationMemorial('nonexistent-id');
    expect(result).toBeNull();
  });

  it('returns null on error', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'error' } });
    const result = await getLocationMemorial('bad-id');
    expect(result).toBeNull();
  });

  it('returns sorted memorial data when found', async () => {
    const locationData = {
      id: 'l1',
      name: 'Test Location',
      location_photos: [
        { id: 'p2', sort_order: 2 },
        { id: 'p1', sort_order: 1 },
      ],
      testimonies: [{ id: 't1', sort_order: 1 }],
      disaster_timeline_events: [
        { id: 'e2', sort_order: 2 },
        { id: 'e1', sort_order: 1 },
      ],
      lessons: [],
      recovery_initiatives: [],
      photo_gallery_items: [],
      statistics: [],
    };
    mockMaybeSingle.mockResolvedValue({ data: locationData, error: null });

    const result = await getLocationMemorial('l1');
    expect(result).not.toBeNull();
    // Verify sorting: sort_order 1 should come before sort_order 2
    expect(result!.location_photos[0].id).toBe('p1');
    expect(result!.timeline_events[0].id).toBe('e1');
  });

  it('returns null on exception', async () => {
    mockMaybeSingle.mockRejectedValue(new Error('Network error'));
    const result = await getLocationMemorial('err-id');
    expect(result).toBeNull();
  });
});
