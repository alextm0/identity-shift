/**
 * Unit Tests for Anti-Bullshit Use Case
 */

import { describe, it, expect } from 'vitest';
import { calculateABS, validateProofOfWork } from '@/use-cases/anti-bullshit';

describe('calculateABS', () => {
  it('should return 100 when both motion and action are 0', () => {
    expect(calculateABS(0, 0)).toBe(100);
  });

  it('should return high score (90-100) when action ratio is >= 0.8', () => {
    expect(calculateABS(2, 8)).toBeGreaterThanOrEqual(90);
    expect(calculateABS(1, 9)).toBeGreaterThanOrEqual(90);
    expect(calculateABS(0, 10)).toBeGreaterThanOrEqual(90);
  });

  it('should return medium score (60-90) when action ratio is >= 0.5 and < 0.8', () => {
    const score = calculateABS(4, 6);
    expect(score).toBeGreaterThanOrEqual(60);
    expect(score).toBeLessThan(90);
  });

  it('should return low score (< 60) when action ratio is < 0.5', () => {
    const score = calculateABS(6, 4);
    expect(score).toBeLessThan(60);
  });

  it('should handle edge case where motion > action', () => {
    const score = calculateABS(8, 2);
    expect(score).toBeLessThan(60);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('should always return a value between 0 and 100', () => {
    const scores = [
      calculateABS(0, 0),
      calculateABS(10, 0),
      calculateABS(0, 10),
      calculateABS(5, 5),
      calculateABS(1, 9),
      calculateABS(9, 1),
    ];

    scores.forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});

describe('validateProofOfWork', () => {
  it('should return true when progress units are 0', () => {
    expect(validateProofOfWork(0, null)).toBe(true);
    expect(validateProofOfWork(0, '')).toBe(true);
  });

  it('should return true when progress units > 0 and proof is provided', () => {
    expect(validateProofOfWork(5, 'This is a valid proof of work')).toBe(true);
    expect(validateProofOfWork(10, 'Another valid proof')).toBe(true);
  });

  it('should return false when progress units > 0 but no proof', () => {
    expect(validateProofOfWork(5, null)).toBe(false);
    expect(validateProofOfWork(5, '')).toBe(false);
  });

  it('should return false when proof is too short', () => {
    expect(validateProofOfWork(5, 'short')).toBe(false);
    expect(validateProofOfWork(5, '123456789')).toBe(false); // 9 chars
  });

  it('should return true when proof is at least 10 characters', () => {
    expect(validateProofOfWork(5, '1234567890')).toBe(true); // exactly 10
    expect(validateProofOfWork(5, 'This is a longer proof')).toBe(true);
  });

  it('should handle whitespace in proof', () => {
    expect(validateProofOfWork(5, '   short   ')).toBe(false);
    expect(validateProofOfWork(5, '   valid proof   ')).toBe(true);
  });
});

