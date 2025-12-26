/**
 * Unit Tests for Validator Utilities
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  validateAndParse,
  safeParseWithErrors,
  formatZodError,
  getFirstError,
  isZodError,
} from '@/lib/validators/utils';
import { ValidationError } from '@/lib/errors';

describe('validator utilities', () => {
  const testSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    age: z.number().min(18, 'Age must be at least 18'),
  });

  describe('validateAndParse', () => {
    it('should parse valid data', () => {
      const result = validateAndParse(testSchema, { name: 'John', age: 25 });
      expect(result).toEqual({ name: 'John', age: 25 });
    });

    it('should throw ValidationError for invalid data', () => {
      expect(() => {
        validateAndParse(testSchema, { name: 'Jo', age: 25 });
      }).toThrow(ValidationError);
    });

    it('should include Zod issues in ValidationError', () => {
      try {
        validateAndParse(testSchema, { name: 'Jo', age: 15 });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).issues).toBeDefined();
      }
    });
  });

  describe('safeParseWithErrors', () => {
    it('should return success for valid data', () => {
      const result = safeParseWithErrors(testSchema, { name: 'John', age: 25 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'John', age: 25 });
      }
    });

    it('should return error for invalid data', () => {
      const result = safeParseWithErrors(testSchema, { name: 'Jo', age: 15 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.issues).toBeDefined();
        expect(result.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('formatZodError', () => {
    it('should format single error', () => {
      const error = z.string().min(5).safeParse('abc').error;
      if (error) {
        const formatted = formatZodError(error);
        // Zod error messages can vary, just check it contains relevant info
        expect(formatted).toMatch(/5|characters|minimum/i);
      }
    });

    it('should format multiple errors', () => {
      const result = testSchema.safeParse({ name: 'Jo', age: 15 });
      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toContain('Validation failed');
        expect(formatted).toContain('name');
        expect(formatted).toContain('age');
      }
    });

    it('should handle empty errors', () => {
      const error = new z.ZodError([]);
      expect(formatZodError(error)).toBe('Validation failed');
    });
  });

  describe('getFirstError', () => {
    it('should return first error message', () => {
      const result = testSchema.safeParse({ name: 'Jo', age: 15 });
      if (!result.success) {
        const firstError = getFirstError(result.error);
        expect(firstError).toBeDefined();
        expect(typeof firstError).toBe('string');
      }
    });

    it('should return default message for empty errors', () => {
      const error = new z.ZodError([]);
      expect(getFirstError(error)).toBe('Validation failed');
    });
  });

  describe('isZodError', () => {
    it('should identify ZodError instances', () => {
      const result = testSchema.safeParse({ name: 'Jo' });
      if (!result.success) {
        expect(isZodError(result.error)).toBe(true);
      }
    });

    it('should return false for other errors', () => {
      expect(isZodError(new Error('test'))).toBe(false);
      expect(isZodError('string')).toBe(false);
      expect(isZodError(null)).toBe(false);
    });
  });
});

