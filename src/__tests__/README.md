# Testing Guide

This directory contains all tests for the Identity Shifter application.

## Test Structure

```
src/__tests__/
├── setup.ts              # Test environment setup
├── mocks/                # Mock implementations
│   ├── auth.ts          # Authentication mocks
│   ├── db.ts            # Database mocks and factories
│   └── database.ts      # Database module mock
├── utils/                # Test utilities
│   └── test-utils.tsx   # Custom render and helpers
├── unit/                 # Unit tests
│   ├── lib/             # Library/utility tests
│   └── use-cases/       # Use case tests
└── integration/         # Integration tests
    └── actions/         # Server action tests

e2e/                      # End-to-end tests (Playwright)
├── auth.spec.ts
├── daily-log-flow.spec.ts
├── sprint-flow.spec.ts
└── weekly-review-flow.spec.ts
```

## Running Tests

### Unit and Integration Tests (Vitest)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/__tests__/unit/lib/sanitize.test.ts
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific E2E test
npm run test:e2e -- e2e/auth.spec.ts
```

## Writing Tests

### Unit Tests

Unit tests should test individual functions in isolation, mocking all dependencies.

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeText } from '@/lib/sanitize';

describe('sanitizeText', () => {
  it('should trim whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });
});
```

### Integration Tests

Integration tests should test the interaction between multiple layers (e.g., actions calling data access functions).

Example:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { saveDailyLogAction } from '@/actions/daily-logs';
import { getActiveSprint } from '@/data-access/sprints';

vi.mock('@/data-access/sprints');

describe('saveDailyLogAction', () => {
  it('should save a daily log', async () => {
    vi.mocked(getActiveSprint).mockResolvedValue(mockSprint);
    // ... test implementation
  });
});
```

### E2E Tests

E2E tests should test complete user flows from the browser perspective.

Example:
```typescript
import { test, expect } from '@playwright/test';

test('should complete daily log flow', async ({ page }) => {
  await page.goto('/dashboard/daily');
  await page.getByLabel(/energy/i).fill('4');
  await page.getByRole('button', { name: /save/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});
```

## Test Utilities

### Mock Factories

Use mock factories from `src/__tests__/mocks/db.ts` to create test data:

```typescript
import { createMockDailyLog, createMockSprint } from '@/__tests__/mocks/db';

const log = createMockDailyLog({ energy: 4 });
const sprint = createMockSprint({ name: 'Test Sprint' });
```

### Custom Render

Use the custom render function from test utils for React component tests:

```typescript
import { render, screen } from '@/__tests__/utils/test-utils';
import MyComponent from '@/components/MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Mocking**: Mock external dependencies (database, auth, etc.)
3. **Naming**: Use descriptive test names that explain what is being tested
4. **Coverage**: Aim for high coverage but focus on critical paths
5. **Speed**: Keep unit tests fast, integration tests moderate, E2E tests can be slower
6. **Maintainability**: Keep tests simple and readable

## CI/CD

Tests are automatically run in CI/CD pipelines:
- Unit and integration tests run on every commit
- E2E tests run on pull requests and main branch
- Coverage reports are generated and tracked

