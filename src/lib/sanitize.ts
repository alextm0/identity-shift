/**
 * Input sanitization utilities to prevent XSS attacks.
 * 
 * Sanitizes user input by escaping HTML entities and removing potentially dangerous content.
 */

/**
 * Escapes HTML entities in a string to prevent XSS attacks.
 * 
 * @param input - The string to escape
 * @returns The escaped string safe for HTML rendering
 */
export function escapeHtml(input: string | null | undefined): string {
  if (!input) return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return input.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Sanitizes a text input by trimming whitespace and escaping HTML.
 * 
 * @param input - The text to sanitize
 * @param maxLength - Optional maximum length (default: 10000)
 * @returns The sanitized string
 */
export function sanitizeText(input: string | null | undefined, maxLength: number = 10000): string {
  if (!input) return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Escape HTML entities
  return escapeHtml(sanitized);
}

/**
 * Sanitizes a URL input to ensure it's safe.
 * 
 * @param url - The URL to sanitize
 * @returns The sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || url.trim() === '') return '';
  
  const trimmed = url.trim();
  
  // Basic URL validation - must start with http:// or https://
  if (!trimmed.match(/^https?:\/\/.+/i)) {
    return '';
  }
  
  // Escape HTML entities
  return escapeHtml(trimmed);
}

