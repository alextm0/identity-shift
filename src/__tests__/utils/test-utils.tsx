/**
 * Test Utilities
 * 
 * Provides helper functions and utilities for testing
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Custom render function that includes providers
 * Use this instead of the default render from @testing-library/react
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    ...options,
  });
}

export * from '@testing-library/react';
export { customRender as render };

/**
 * Helper to create a mock date
 */
export function createMockDate(year: number, month: number, day: number): Date {
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Helper to create a mock user ID
 */
export function createMockUserId(): string {
  return 'test-user-id-' + Math.random().toString(36).substring(7);
}

/**
 * Helper to wait for async operations
 */
export async function waitForAsync() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Helper to create mock form data
 */
export function createMockFormData(data: Record<string, string | File>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

