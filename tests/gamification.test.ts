import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { calculateStreak, calculateXP, filterHomeworksByPeriod } from '../src/utils/gamification';
import { Timestamp } from 'firebase/firestore';
import type { Homework } from '../src/types';

describe('gamification utils', () => {
  describe('calculateXP', () => {
    it('returns 20 when withPhoto is true', () => {
      expect(calculateXP(true)).toBe(20);
    });
    it('returns 10 when withPhoto is false', () => {
      expect(calculateXP(false)).toBe(10);
    });
  });

  describe('calculateStreak', () => {
    it('starts streak at 1 if lastDate is null', () => {
      const { streak } = calculateStreak(null, new Date('2023-10-24T12:00:00Z'), 0);
      expect(streak).toBe(1);
    });

    it('keeps same streak if completed on the same day', () => {
      const last = new Date('2023-10-24T08:00:00Z');
      const now = new Date('2023-10-24T12:00:00Z');
      const { streak } = calculateStreak(last, now, 5);
      expect(streak).toBe(5);
    });

    it('increments streak if completed on the next day', () => {
      const last = new Date('2023-10-23T23:00:00Z');
      const now = new Date('2023-10-24T08:00:00Z');
      const { streak } = calculateStreak(last, now, 5);
      expect(streak).toBe(6);
    });

    it('resets streak to 1 if more than one day passed', () => {
      const last = new Date('2023-10-22T23:00:00Z');
      const now = new Date('2023-10-24T08:00:00Z');
      const { streak } = calculateStreak(last, now, 5);
      expect(streak).toBe(1);
    });
  });

  describe('filterHomeworksByPeriod', () => {
    const mockHomework = (id: string, dateStr: string): Homework => ({
      id, userId: 'u1', materia: 'Math', titulo: 'Test', descricao: '',
      prioridade: 'tranquilo', exigeFoto: false, status: 'pendente',
      dataConclusao: null, xpGanho: null,
      prazo: Timestamp.fromDate(new Date(dateStr)),
      createdAt: Timestamp.fromDate(new Date('2023-10-01T00:00:00Z'))
    });

    const items = [
      mockHomework('h1', '2023-10-24T12:00:00Z'), // today
      mockHomework('h2', '2023-10-25T12:00:00Z'), // tomorrow
      mockHomework('h3', '2023-10-31T12:00:00Z')  // next week
    ];

    beforeAll(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-10-24T08:00:00Z'));
    });
    
    afterAll(() => {
      vi.useRealTimers();
    });

    it('filters today correctly', () => {
      const res = filterHomeworksByPeriod(items, 'hoje');
      expect(res.map(i => i.id)).toEqual(['h1']);
    });

    it('filters this week correctly', () => {
      const res = filterHomeworksByPeriod(items, 'semana');
      expect(res.map(i => i.id)).toEqual(['h1', 'h2']);
    });

    it('returns all for all', () => {
      const res = filterHomeworksByPeriod(items, 'todos');
      expect(res.length).toBe(3);
    });
  });
});
