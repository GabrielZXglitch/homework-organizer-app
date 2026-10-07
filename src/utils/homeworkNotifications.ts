import type { Homework } from '../types';
import { dueReminder, reminderKey } from './homeworkTiming';

export async function notifyHomework(hw: Homework, now: Date, isActive: () => boolean) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const stage = dueReminder(hw, now);
  if (!stage) return;
  const key = reminderKey(hw, stage);
  if (localStorage.getItem(key)) return;

  const options = {
    body: stage === 'advance'
      ? `“${hw.titulo}” vence amanhã. Comece com antecedência!`
      : `“${hw.titulo}” deve ser entregue hoje. Confira seu prazo!`,
    icon: '/logo.png',
    tag: key,
  };
  // Mobile browsers require notifications through the PWA service worker.
  const registration = 'serviceWorker' in navigator
    ? await navigator.serviceWorker.getRegistration()
    : undefined;
  if (!isActive() || dueReminder(hw, new Date()) !== stage || localStorage.getItem(key)) return;
  if (registration) {
    await registration.showNotification('Lembrete de Dever', options);
  } else {
    new Notification('Lembrete de Dever', options);
  }
  localStorage.setItem(key, 'sent');
}
