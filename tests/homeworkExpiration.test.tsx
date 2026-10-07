// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Homework } from '../src/types';

const mocks = vi.hoisted(() => ({
  user: { uid: 'u1' },
  onSnapshot: vi.fn(),
  runTransaction: vi.fn(),
  update: vi.fn(),
  latest: {} as Homework,
}));
vi.mock('../src/lib/firebase', () => ({ db: {} }));
vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: mocks.user, userProfile: null }),
}));
vi.mock('firebase/firestore', async importOriginal => ({
  ...await importOriginal<typeof import('firebase/firestore')>(),
  collection: vi.fn(), query: vi.fn(), where: vi.fn(), doc: vi.fn(() => 'hw1'),
  onSnapshot: mocks.onSnapshot, runTransaction: mocks.runTransaction,
}));
import { HomeworkProvider, useHomeworks } from '../src/contexts/HomeworkContext';

function Status() {
  const { homeworks } = useHomeworks();
  return <div data-testid="status">{homeworks.map(hw => hw.status).join(',')}</div>;
}

async function loadHomework(hw: Homework) {
  mocks.latest = hw;
  render(<HomeworkProvider><Status /></HomeworkProvider>);
  await act(async () => {
    const receive = mocks.onSnapshot.mock.calls[0][1];
    receive({ forEach: (callback: (doc: unknown) => void) => callback({
      id: hw.id, data: () => hw,
    }) });
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 8, 17, 59, 59));
  vi.stubGlobal('Notification', { permission: 'denied' });
  mocks.onSnapshot.mockReset().mockReturnValue(vi.fn());
  mocks.update.mockReset();
  mocks.runTransaction.mockReset().mockImplementation(async (_db, callback) => callback({
    get: async () => ({ exists: () => true, data: () => mocks.latest }),
    update: mocks.update,
  }));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const homework = (status: Homework['status'] = 'pendente'): Homework => ({
  id: 'hw1', userId: 'u1', titulo: 'Matemática', materia: 'Matemática', descricao: '',
  prazo: new Date(2026, 9, 8, 18), status, prioridade: 'tranquilo',
  exigeFoto: false, dataConclusao: null, xpGanho: null, createdAt: new Date(2026, 9, 1),
});

describe('automatic expiration in HomeworkProvider', () => {
  it('updates the UI and Firestore as the deadline passes without a new snapshot', async () => {
    await loadHomework(homework());
    expect(screen.getByTestId('status').textContent).toBe('pendente');
    await act(async () => { await vi.advanceTimersByTimeAsync(1001); });
    expect(screen.getByTestId('status').textContent).toBe('atrasado');
    expect(mocks.update).toHaveBeenCalledWith('hw1', { status: 'atrasado' });
  });

  it('expires existing overdue homework on load', async () => {
    vi.setSystemTime(new Date(2026, 9, 9));
    await loadHomework(homework());
    expect(screen.getByTestId('status').textContent).toBe('atrasado');
    expect(mocks.update).toHaveBeenCalledWith('hw1', { status: 'atrasado' });
  });

  it('does not overwrite a completion on another device', async () => {
    await loadHomework(homework());
    mocks.latest = homework('concluido');
    await act(async () => { await vi.advanceTimersByTimeAsync(1001); });
    expect(mocks.runTransaction).toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rechecks after resuming a suspended tab and cleans up timers on unmount', async () => {
    await loadHomework(homework());
    vi.setSystemTime(new Date(2026, 9, 9));
    await act(async () => { window.dispatchEvent(new Event('focus')); });
    expect(screen.getByTestId('status').textContent).toBe('atrasado');
    expect(mocks.update).toHaveBeenCalledWith('hw1', { status: 'atrasado' });
    cleanup();
    const calls = mocks.runTransaction.mock.calls.length;
    await act(async () => { await vi.advanceTimersByTimeAsync(120_000); });
    expect(mocks.runTransaction).toHaveBeenCalledTimes(calls);
  });

  it('keeps the UI overdue and retries if persistence fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.runTransaction.mockRejectedValueOnce(new Error('offline'));
    vi.setSystemTime(new Date(2026, 9, 9));
    await loadHomework(homework());
    expect(screen.getByTestId('status').textContent).toBe('atrasado');
    expect(mocks.update).not.toHaveBeenCalled();
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(mocks.update).toHaveBeenCalledWith('hw1', { status: 'atrasado' });
  });
});
