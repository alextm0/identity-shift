/**
 * Authentication helpers for E2E tests
 */

import { Page } from '@playwright/test';

/**
 * Signs in a test user
 * Note: This requires a test user to exist in the database
 */
export async function signIn(page: Page, email: string = 'test@example.com', password: string = 'testpassword') {
  await page.goto('/auth/sign-in');
  
  // Wait for form to be visible
  await page.waitForSelector('input[name="email"]');
  
  // Fill in credentials
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Checks if user is authenticated by trying to access dashboard
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    const currentUrl = page.url();
    return !currentUrl.includes('/auth/sign-in');
  } catch {
    return false;
  }
}


