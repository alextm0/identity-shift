# E2E Tests

End-to-end tests for the Identity Shifter application using Playwright.

## Setup

1. Make sure the development server is running:
   ```bash
   npm run dev
   ```

2. Run E2E tests:
   ```bash
   npm run test:e2e
   ```

3. Run E2E tests with UI:
   ```bash
   npm run test:e2e:ui
   ```

## Test Structure

- `auth.spec.ts` - Authentication flow tests
- `daily-log-flow.spec.ts` - Daily log workflow tests
- `sprint-flow.spec.ts` - Sprint management tests
- `weekly-review-flow.spec.ts` - Weekly review tests
- `helpers/auth.ts` - Authentication helper functions

## Current Status

Most E2E tests are currently skipped because they require:
1. **Authentication setup** - Tests need authenticated users
2. **Test data** - Tests need active sprints, daily logs, etc.
3. **Form structure understanding** - Some forms use custom components

## Authentication

The tests check if the user is authenticated by attempting to access protected routes. If redirected to `/auth/sign-in`, tests are automatically skipped.

To enable tests:
1. Set up test user authentication
2. Use the `signIn` helper from `helpers/auth.ts`
3. Configure test data in your test database

## Writing New Tests

1. Check authentication status in `beforeEach`
2. Use actual element selectors (check component code for `name` attributes, `data-testid`, etc.)
3. Wait for elements to be visible before interacting
4. Use `test.skip()` for tests that require setup

## Known Issues

- Custom form components (EnergySlider, ProgressBar) need specific interaction patterns
- Some tests require test data setup (sprints, daily logs)
- Authentication flow needs to be properly mocked or configured




