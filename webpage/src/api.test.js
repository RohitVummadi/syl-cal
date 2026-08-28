import { beforeEach, describe, expect, it, vi } from 'vitest';

const getIdToken = vi.fn().mockResolvedValue('token-123');
vi.mock('./firebase', () => ({ auth: { currentUser: { getIdToken } } }));

const { processSyllabi } = await import('./api');

describe('processSyllabi', () => {
  beforeEach(() => {
    getIdToken.mockClear();
    global.fetch = vi.fn();
  });

  it('sends the Firebase token with the PDF upload', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue({ calendarId: 'abc' }) });

    await processSyllabi([new File(['%PDF-1.7'], 'course.pdf', { type: 'application/pdf' })]);

    expect(global.fetch).toHaveBeenCalledWith('/api/process-syllabi', expect.objectContaining({
      method: 'POST',
      headers: { Authorization: 'Bearer token-123' },
    }));
  });
});
