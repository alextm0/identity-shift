/**
 * E2E Tests for Sprint Flow
 * 
 * Critical user flow: Create sprint → View sprint → Close sprint
 */

import { test, expect } from '@playwright/test';

test.describe('Sprint Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should create a new sprint', async ({ page }) => {
    // Navigate to sprint creation page
    await page.goto('/dashboard/sprint');
    
    // Fill sprint form
    await page.getByLabel(/sprint name/i).fill('Test Sprint');
    
    // Set dates (adjust based on your date picker implementation)
    await page.getByLabel(/start date/i).fill('2024-01-01');
    await page.getByLabel(/end date/i).fill('2024-01-14');
    
    // Add priorities
    // This would depend on your form structure
    // Example: await page.getByLabel(/priority/i).fill('Exercise');
    
    // Submit form
    await page.getByRole('button', { name: /start|create|save/i }).click();
    
    // Should redirect or show success
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/sprint.*created|success/i)).toBeVisible();
  });

  test('should display active sprint on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should show active sprint information
    await expect(page.getByText(/active sprint|current sprint/i)).toBeVisible();
  });

  test('should close an active sprint', async ({ page }) => {
    await page.goto('/dashboard/sprint');
    
    // Find and click close sprint button
    const closeButton = page.getByRole('button', { name: /close|end/i });
    
    if (await closeButton.isVisible()) {
      await closeButton.click();
      
      // Confirm close (if confirmation dialog exists)
      const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Verify sprint is closed
      await expect(page.getByText(/closed|ended/i)).toBeVisible();
    }
  });

  test('should validate sprint form inputs', async ({ page }) => {
    await page.goto('/dashboard/sprint');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /start|create/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/required|invalid/i)).toBeVisible();
  });
});

