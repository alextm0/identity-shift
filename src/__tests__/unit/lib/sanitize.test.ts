/**
 * Unit Tests for Sanitize Utilities
 */

import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeText, sanitizeUrl } from '@/lib/sanitize';

describe('sanitize utilities', () => {
  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape all dangerous characters', () => {
      expect(escapeHtml('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&#039;');
    });

    it('should return empty string for null/undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('should handle normal text without escaping', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('sanitizeText', () => {
    it('should trim whitespace', () => {
      expect(sanitizeText('  hello  ')).toBe('hello');
    });

    it('should enforce max length', () => {
      const longText = 'a'.repeat(100);
      expect(sanitizeText(longText, 10)).toBe('a'.repeat(10));
    });

    it('should escape HTML entities', () => {
      expect(sanitizeText('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should return empty string for null/undefined', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
    });

    it('should use default max length of 10000', () => {
      const longText = 'a'.repeat(20000);
      expect(sanitizeText(longText).length).toBe(10000);
    });
  });

  describe('sanitizeUrl', () => {
    it('should accept valid http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should accept valid https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should reject URLs without protocol', () => {
      expect(sanitizeUrl('example.com')).toBe('');
    });

    it('should reject javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert("xss")')).toBe('');
    });

    it('should escape HTML entities in URLs', () => {
      expect(sanitizeUrl('https://example.com?q=<script>')).toBe(
        'https://example.com?q=&lt;script&gt;'
      );
    });

    it('should return empty string for null/undefined/empty', () => {
      expect(sanitizeUrl(null)).toBe('');
      expect(sanitizeUrl(undefined)).toBe('');
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl('   ')).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
    });
  });
});

