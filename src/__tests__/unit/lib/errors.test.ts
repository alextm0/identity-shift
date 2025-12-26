/**
 * Unit Tests for Error Classes
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  BusinessRuleError,
  RateLimitError,
  isAppError,
  getErrorMessage,
  getErrorCode,
} from '@/lib/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with message', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AppError');
    });

    it('should create error with code and statusCode', () => {
      const error = new AppError('Test error', 'TEST_CODE', 400);
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });

    it('should store validation issues', () => {
      const issues = [{ field: 'email', message: 'Invalid email' }];
      const error = new ValidationError('Validation failed', issues);
      expect(error.issues).toEqual(issues);
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error', () => {
      const error = new AuthorizationError();
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.statusCode).toBe(403);
    });

    it('should accept custom message', () => {
      const error = new AuthorizationError('Custom message');
      expect(error.message).toBe('Custom message');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError();
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.statusCode).toBe(404);
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('DatabaseError', () => {
    it('should create database error', () => {
      const originalError = new Error('DB connection failed');
      const error = new DatabaseError('Database operation failed', originalError);
      expect(error.message).toBe('Database operation failed');
      expect(error.originalError).toBe(originalError);
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('BusinessRuleError', () => {
    it('should create business rule error', () => {
      const error = new BusinessRuleError('Business rule violated');
      expect(error.message).toBe('Business rule violated');
      expect(error.code).toBe('BUSINESS_RULE_ERROR');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error', () => {
      const error = new RateLimitError();
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.statusCode).toBe(429);
    });

    it('should accept custom message', () => {
      const error = new RateLimitError('Too many requests');
      expect(error.message).toBe('Too many requests');
    });
  });
});

describe('Error Helper Functions', () => {
  describe('isAppError', () => {
    it('should identify AppError instances', () => {
      expect(isAppError(new ValidationError('test'))).toBe(true);
      expect(isAppError(new NotFoundError('test'))).toBe(true);
    });

    it('should return false for other errors', () => {
      expect(isAppError(new Error('test'))).toBe(false);
      expect(isAppError('string')).toBe(false);
      expect(isAppError(null)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from AppError', () => {
      const error = new ValidationError('Validation failed');
      expect(getErrorMessage(error)).toBe('Validation failed');
    });

    it('should extract message from Error', () => {
      const error = new Error('Generic error');
      expect(getErrorMessage(error)).toBe('Generic error');
    });

    it('should return default message for unknown errors', () => {
      expect(getErrorMessage('string')).toBe('An unknown error occurred');
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
    });
  });

  describe('getErrorCode', () => {
    it('should extract code from AppError', () => {
      const error = new ValidationError('test');
      expect(getErrorCode(error)).toBe('VALIDATION_ERROR');
    });

    it('should return undefined for non-AppError', () => {
      expect(getErrorCode(new Error('test'))).toBeUndefined();
      expect(getErrorCode('string')).toBeUndefined();
    });
  });
});

