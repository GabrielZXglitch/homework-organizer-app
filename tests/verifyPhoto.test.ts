import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../api/verify-photo';

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
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Groq photo verification', () => {
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
