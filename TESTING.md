# Testing Guide for Smart Bookmark

This document outlines the testing infrastructure and how to run tests for the Smart Bookmark application.

## Testing Stack

### Unit & Integration Tests
- **Jest**: JavaScript testing framework
- **React Testing Library**: For testing React components
- **@testing-library/user-event**: For simulating user interactions

## Installation

All testing dependencies have been added to `package.json`. To install:

```bash
npm install
```

## Running Tests

### Unit & Integration Tests

Run all unit and integration tests:
```bash
npm test
```

Run tests in watch mode (re-run on file changes):
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## Test Files Structure

```
project/
├── __tests__/
│   ├── test-utils.tsx          # Custom render function and mocks
│   └── components/
│       ├── AuthButton.test.tsx   # AuthButton component tests
│       ├── LoginCard.test.tsx    # LoginCard component tests
│       ├── BookmarkCard.test.tsx # BookmarkCard component tests
│       └── AddBookmarkForm.test.tsx # Form component tests
├── jest.config.js              # Jest configuration
└── jest.setup.js               # Jest setup and mocks
```

## Test Coverage

### Unit Tests

#### AuthButton Component
- ✅ Loading state display
- ✅ Sign in button rendering (unauthenticated)
- ✅ Button styling and icons
- ✅ User info display (authenticated)
- ✅ Sign out functionality
- ✅ Avatar rendering

#### LoginCard Component
- ✅ Title, subtitle, and description rendering
- ✅ Animation classes
- ✅ Dark mode support
- ✅ Component structure
- ✅ AuthButton integration

#### BookmarkCard Component
- ✅ Bookmark title and URL rendering
- ✅ Description display
- ✅ Tags rendering
- ✅ Date formatting
- ✅ Delete button functionality
- ✅ Dark mode support

#### AddBookmarkForm Component
- ✅ Form field rendering
- ✅ URL validation
- ✅ Form submission
- ✅ Tag parsing
- ✅ Error handling
- ✅ Loading states
- ✅ Success callback

### Integration Tests
- ✅ Bookmark creation workflow
- ✅ Form validation and submission
- ✅ Error handling and display

## Key Testing Practices

### Mocking
- Supabase client is mocked in unit tests to avoid external dependencies
- Components that depend on server actions are properly mocked
- Next.js router and navigation utilities are mocked

### User-Centric Testing
- Tests simulate real user interactions using `userEvent`
- Tests focus on what users see and interact with
- Avoid testing implementation details

### Test Organization
- Tests are organized by component/feature
- Each test file follows the pattern: `ComponentName.test.tsx`
- Test suites are well-organized with descriptive names

### Best Practices
- Each test has a clear, single responsibility
- Tests are independent and can run in any order
- Proper setup and teardown using `beforeEach` and `afterEach`
- Mock functions are cleared between tests

## Running Tests in CI/CD

For continuous integration (GitHub Actions, etc.):

```bash
# Run all tests
npm test
npm run test:coverage
```

Example `.github/workflows/test.yml`:
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Troubleshooting

### Tests timing out
- Increase Jest timeout: `jest.setTimeout(10000)` in test file

### Module not found errors
- Ensure `moduleNameMapper` in `jest.config.js` matches your path aliases
- Check that `@/` paths resolve correctly

### Supabase test errors
- Mocks are automatically provided in test setup
- Ensure `jest.mock()` calls are at the top of test files
- Check mock return values match expected interface

## Coverage Goals

Current test coverage focuses on:
- ✅ Critical user flows
- ✅ Component rendering
- ✅ User interactions
- ✅ Error states
- ✅ Edge cases

Target for production:
- Unit tests: 80%+ coverage
- Integration tests: Key workflows tested

## Test Commands Summary

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |

