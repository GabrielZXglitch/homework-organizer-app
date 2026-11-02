import { afterEach, expect, it, vi } from 'vitest';
import { verifyHomeworkPhoto } from '../src/utils/verifyHomeworkPhoto';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it('uses the default cooldown when a 429 response is not JSON', async () => {
  const request = vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => { throw new Error('HTML'); } });
  vi.stubGlobal('fetch', request);
  await expect(verifyHomeworkPhoto('data:image/jpeg;base64,test', 0, new AbortController()))
    .rejects.toMatchObject({ retryAfterSeconds: 60 });
  expect(request).toHaveBeenCalledTimes(1);
});

it('reports timeout while reading a response body and clears the timer', async () => {
  vi.useFakeTimers();
  const controller = new AbortController();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true, status: 200,
    json: () => new Promise((_resolve, reject) => controller.signal.addEventListener('abort', () => reject(new Error('aborted')))),
  }));
  const pending = verifyHomeworkPhoto('data:image/jpeg;base64,test', 0, controller);
  const assertion = expect(pending).rejects.toThrow('A validação demorou demais');
  await vi.advanceTimersByTimeAsync(30_000);
  await assertion;
  expect(vi.getTimerCount()).toBe(0);
});
