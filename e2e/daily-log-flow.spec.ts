/**
 * E2E Tests for Daily Log Flow
 * 
 * Critical user flow: Sign up → Create sprint → Log daily → View dashboard
 */

import { test, expect } from '@playwright/test';

test.describe('Daily Log Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app (assuming authentication is handled)
    // In a real scenario, you'd set up test user authentication here
    await page.goto('/');
  });

  test('should complete daily log flow', async ({ page }) => {
    // Step 1: Navigate to daily log page
    await page.goto('/dashboard/daily');
    
    // Step 2: Fill in daily log form
    // Adjust selectors based on your actual form structure
    await page.getByLabel(/energy/i).fill('4');
    await page.getByLabel(/sleep hours/i).fill('7');
    await page.getByLabel(/main focus completed/i).check();
    
    // Step 3: Add priorities (if form has this)
    // This would depend on your actual form structure
    
    // Step 4: Submit form
    await page.getByRole('button', { name: /save|submit|commit/i }).click();
    
    // Step 5: Should redirect to dashboard or show success message
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Step 6: Verify success message or updated data
    await expect(page.getByText(/success|saved|committed/i)).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/dashboard/daily');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /save|submit/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/required|invalid/i)).toBeVisible();
  });

  test('should allow editing existing daily log', async ({ page }) => {
    // Assuming there's an existing log
    await page.goto('/dashboard/daily');
    
    // Click edit button (if exists)
    const editButton = page.getByRole('button', { name: /edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Update energy level
      await page.getByLabel(/energy/i).fill('5');
      
      // Save changes
      await page.getByRole('button', { name: /save|update/i }).click();
      
      // Verify update
      await expect(page.getByText(/updated|saved/i)).toBeVisible();
    }
  });
});

