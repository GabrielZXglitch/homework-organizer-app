// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Homework } from '../src/types';
import { notifyHomework } from '../src/utils/homeworkNotifications';
import { reminderKey } from '../src/utils/homeworkTiming';

const hw: Homework = {
  id: 'hw1', userId: 'u1', titulo: 'Matemática', materia: 'Matemática', descricao: '',
  prazo: new Date(2026, 9, 8, 18), status: 'pendente', prioridade: 'tranquilo',
  exigeFoto: false, dataConclusao: null, xpGanho: null, createdAt: new Date(2026, 9, 1),
};
const notification = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 7, 9));
  localStorage.clear();
  notification.mockReset();
  vi.stubGlobal('Notification', Object.assign(notification, { permission: 'granted' }));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('local notifications', () => {
  it('sends once the previous day, then again on the due day after reloading', async () => {
    await notifyHomework(hw, new Date(), () => true);
    await notifyHomework(hw, new Date(), () => true);
    expect(notification).toHaveBeenCalledTimes(1);
    vi.setSystemTime(new Date(2026, 9, 8, 9));
    await notifyHomework(hw, new Date(), () => true);
    await notifyHomework(hw, new Date(), () => true);
    expect(notification).toHaveBeenCalledTimes(2);
  });

  it('allows new homework and another user to receive their own reminders', async () => {
    await notifyHomework(hw, new Date(), () => true);
    await notifyHomework({ ...hw, id: 'hw2' }, new Date(), () => true);
    await notifyHomework({ ...hw, userId: 'u2' }, new Date(), () => true);
    expect(notification).toHaveBeenCalledTimes(3);
  });

  it('uses the service worker for mobile/PWA notifications', async () => {
    const showNotification = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { serviceWorker: { getRegistration: vi.fn().mockResolvedValue({ showNotification }) } });
    await notifyHomework(hw, new Date(), () => true);
    expect(showNotification).toHaveBeenCalledOnce();
    expect(notification).not.toHaveBeenCalled();
  });

  it('retries failed delivery without marking it sent', async () => {
    notification.mockImplementationOnce(() => { throw new Error('delivery failed'); });
    await expect(notifyHomework(hw, new Date(), () => true)).rejects.toThrow('delivery failed');
    expect(localStorage.getItem(reminderKey(hw, 'advance'))).toBeNull();
    await notifyHomework(hw, new Date(), () => true);
    expect(localStorage.getItem(reminderKey(hw, 'advance'))).toBe('sent');
  });

  it('does not notify after unmount, without permission, or after expiration', async () => {
    await notifyHomework(hw, new Date(), () => false);
    vi.stubGlobal('Notification', Object.assign(notification, { permission: 'denied' }));
    await notifyHomework(hw, new Date(), () => true);
    vi.stubGlobal('Notification', Object.assign(notification, { permission: 'granted' }));
    vi.setSystemTime(new Date(2026, 9, 9));
    await notifyHomework(hw, new Date(), () => true);
    expect(notification).not.toHaveBeenCalled();
  });
});
