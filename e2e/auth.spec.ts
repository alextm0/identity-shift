/**
 * E2E Tests for Authentication Flow
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to sign-in page
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('should display sign-in form', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Check for sign-in form elements
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    
    expect(emailInput).toBeVisible();
    expect(passwordInput).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/sign-in');
    
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit form (adjust selector based on your actual form)
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible();
  });
});

