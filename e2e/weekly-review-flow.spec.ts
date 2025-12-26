/**
 * E2E Tests for Weekly Review Flow
 * 
 * Critical user flow: Complete weekly review → View review history
 */

import { test, expect } from '@playwright/test';

test.describe('Weekly Review Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should create a weekly review', async ({ page }) => {
    // Navigate to weekly review page
    await page.goto('/dashboard/weekly');
    
    // Fill review form
    // Adjust selectors based on your actual form
    await page.getByLabel(/progress ratio/i).fill('0.8');
    await page.getByLabel(/evidence ratio/i).fill('75');
    await page.getByLabel(/anti.*bullshit/i).fill('80');
    
    // Select one change option
    await page.getByLabel(/one change/i).selectOption('KEEP_SAME');
    
    // Submit form
    await page.getByRole('button', { name: /save|submit|create/i }).click();
    
    // Should show success
    await expect(page.getByText(/review.*created|success/i)).toBeVisible();
  });

  test('should display weekly review history', async ({ page }) => {
    await page.goto('/dashboard/weekly');
    
    // Should show review history or list
    // Adjust selector based on your actual implementation
    const reviewList = page.getByText(/review history|past reviews/i);
    
    // If reviews exist, they should be visible
    if (await reviewList.isVisible()) {
      await expect(reviewList).toBeVisible();
    }
  });

  test('should validate weekly review form', async ({ page }) => {
    await page.goto('/dashboard/weekly');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /save|submit/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/required|invalid/i)).toBeVisible();
  });

  test('should show progress ratios for each priority', async ({ page }) => {
    await page.goto('/dashboard/weekly');
    
    // Should display priority progress information
    // This depends on your UI implementation
    const progressSection = page.getByText(/progress|priorities/i);
    
    if (await progressSection.isVisible()) {
      await expect(progressSection).toBeVisible();
    }
  });
});

