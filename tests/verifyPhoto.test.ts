import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler, { retryAfterSeconds } from '../api/verify-photo';

const fetchMock = vi.fn();
const photo = { base64Data: 'unit-test-image', mimeType: 'image/jpeg' };
function response() {
  const res = { status: vi.fn(), json: vi.fn(), end: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}
async function verify(body: unknown = photo, method = 'POST') {
  const res = response();
  await handler({ method, body } as VercelRequest, res as unknown as VercelResponse);
  return res;
}
beforeEach(() => {
  vi.stubEnv('GROQ_API_KEY', 'unit-test-only');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Groq photo verification', () => {
  it.each([
    ['120', 120], ['86400', 86400], ['0', 0], ['1.5', 2],
    [null, 60], ['invalid', 60], ['-1', 60],
    ['Mon, 02 Nov 2026 18:02:00 GMT', 120],
    ['Mon, 02 Nov 2026 17:59:00 GMT', 0],
  ])('parses Retry-After %s without shortening long waits', (header, seconds) => {
    expect(retryAfterSeconds(header, Date.parse('2026-11-02T18:00:00Z'))).toBe(seconds);
  });
  it('preserves 429 without reading the provider body or retrying', async () => {
    const rawBody = vi.fn();
    fetchMock.mockResolvedValue({ ok: false, status: 429, headers: new Headers({ 'Retry-After': '3600' }), json: rawBody });
    const res = await verify();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'RATE_LIMITED', retryAfterSeconds: 3600 }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(rawBody).not.toHaveBeenCalled();
  });
  it('aborts after 20 seconds with a safe timeout response and no retries', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new Error('sensitive-provider-data')));
    }));
    const pending = verify();
    await vi.advanceTimersByTimeAsync(20_000);
    const res = await pending;
    expect(res.status).toHaveBeenCalledWith(504);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'VALIDATION_TIMEOUT' }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain('sensitive');
  });
  it('rejects oversized photos before contacting the provider', async () => {
    const res = await verify({ ...photo, base64Data: 'a'.repeat(4_000_000) });
    expect(res.status).toHaveBeenCalledWith(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(['YES NO', 'not YES', 'YES, approved', '', null])('does not treat ambiguous output %s as approval', async content => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content } }] }) });
    const res = await verify();
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_RESPONSE' }));
  });
  it.each([['YES', true], ['NO', false]])('preserves the verification result for %s', async (content, approved) => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content } }] }) });
    const res = await verify();
    expect(res.json).toHaveBeenCalledWith({ aprovado: approved });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(options.headers.Authorization).toBe('Bearer unit-test-only');
    const payload = JSON.parse(options.body);
    expect(payload.model).toBe('qwen/qwen3.8-27b');
    expect(payload.messages[0].content[0].image_url.url).toBe('data:image/jpeg;base64,unit-test-image');
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
  it('does not return or log raw provider errors, photos or credentials', async () => {
    const rawBody = vi.fn(async () => ({ error: 'unit-test-only unit-test-image' }));
    fetchMock.mockResolvedValue({ ok: false, status: 401, json: rawBody });
    const res = await verify();
    expect(res.status).toHaveBeenCalledWith(502);
    expect(rawBody).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Falha na validação Groq. Status HTTP:', 401);
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('unit-test');
    expect(console.log).not.toHaveBeenCalled();
  });
  it('does not log exceptions that could contain Authorization headers', async () => {
    fetchMock.mockRejectedValue(new Error('unit-test-only unit-test-image'));
    const res = await verify();
    expect(res.status).toHaveBeenCalledWith(502);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Não foi possível consultar a validação Groq.');
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('unit-test');
  });
  it('does not send a request when the server credential is missing', async () => {
    vi.stubEnv('GROQ_API_KEY', '');
    const res = await verify();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('returns a retryable error for malformed provider data', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
    const res = await verify();
    expect(res.status).toHaveBeenCalledWith(502);
  });
  it.each([{}, { base64Data: '', mimeType: 'image/jpeg' }, { base64Data: 'abc', mimeType: 'text/plain' }])('rejects invalid input before consulting Groq', async body => {
    const res = await verify(body);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('preserves the method restriction', async () => {
    const res = await verify(photo, 'GET');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
