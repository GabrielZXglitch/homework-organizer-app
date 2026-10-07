import { describe, expect, it } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import type { Homework } from '../src/types';
import { dueReminder, effectiveStatus, nextTimingCheck, reminderKey, reminderTimes } from '../src/utils/homeworkTiming';

const makeHomework = (prazo: Date | Timestamp, status: Homework['status'] = 'pendente'): Homework => ({
  id: 'hw1', userId: 'u1', titulo: 'Matemática', materia: 'Matemática', descricao: '',
  prazo, status, prioridade: 'tranquilo', exigeFoto: false, dataConclusao: null,
  xpGanho: null, createdAt: new Date(2026, 9, 1),
});

describe('homework deadlines and reminders', () => {
  it.each([0, 8, 23])('schedules at least 24h ahead for a deadline at %i:00', hour => {
    const deadline = new Date(2026, 9, 8, hour);
    const times = reminderTimes(deadline);
    expect(deadline.getTime() - times.advance).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000);
    expect(times.today).toBe(new Date(2026, 9, 8).getTime());
  });

  it('has distinct previous-day and delivery-day reminders', () => {
    const hw = makeHomework(new Date(2026, 9, 8, 18));
    expect(dueReminder(hw, new Date(2026, 9, 6, 23, 59))).toBeNull();
    expect(dueReminder(hw, new Date(2026, 9, 7))).toBe('advance');
    expect(dueReminder(hw, new Date(2026, 9, 8))).toBe('today');
    expect(dueReminder(hw, new Date(2026, 9, 8, 18, 0, 1))).toBeNull();
  });

  it.each(['date', 'timestamp'])('expires immediately after the exact deadline (%s)', kind => {
    const deadline = new Date(2026, 9, 8, 18);
    const hw = makeHomework(kind === 'date' ? deadline : Timestamp.fromDate(deadline));
    expect(effectiveStatus(hw, deadline)).toBe('pendente');
    expect(effectiveStatus(hw, new Date(deadline.getTime() + 1))).toBe('atrasado');
    expect(nextTimingCheck([hw], deadline)).toBe(1);
  });

  it('never expires or reminds completed homework', () => {
    const hw = makeHomework(new Date(2026, 9, 8, 18), 'concluido');
    expect(effectiveStatus(hw, new Date(2026, 9, 9))).toBe('concluido');
    expect(dueReminder(hw, new Date(2026, 9, 7))).toBeNull();
  });

  it('restores pending status when an overdue deadline is extended', () => {
    expect(effectiveStatus(makeHomework(new Date(2026, 9, 10), 'atrasado'), new Date(2026, 9, 9))).toBe('pendente');
  });

  it('separates deduplication by user, homework, deadline and reminder stage', () => {
    const hw = makeHomework(new Date(2026, 9, 8, 18));
    const key = reminderKey(hw, 'advance');
    expect(reminderKey(hw, 'today')).not.toBe(key);
    expect(reminderKey({ ...hw, id: 'hw2' }, 'advance')).not.toBe(key);
    expect(reminderKey({ ...hw, userId: 'u2' }, 'advance')).not.toBe(key);
    expect(reminderKey({ ...hw, prazo: new Date(2026, 9, 9, 18) }, 'advance')).not.toBe(key);
  });

  it('wakes at midnight without any Firestore changes', () => {
    const hw = makeHomework(new Date(2026, 9, 8, 18));
    expect(nextTimingCheck([hw], new Date(2026, 9, 6, 23, 59, 59))).toBe(1000);
    expect(nextTimingCheck([hw], new Date(2026, 9, 7, 23, 59, 59))).toBe(1000);
  });
});
