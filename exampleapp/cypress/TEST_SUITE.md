# Cypress Test Suite

## Overview

This test suite contains **30 simple, focused E2E tests** for the MeetingFlow application. Each test is in its own file and tests a single piece of functionality.

## Complete Test List

| # | Test File | Description | Category |
|---|-----------|-------------|----------|
| 01 | `01-page-loads.cy.ts` | Homepage loads successfully | 🏠 Basic |
| 02 | `02-dashboard-visible.cy.ts` | Dashboard heading is visible | 🏠 Basic |
| 03 | `03-sidebar-visible.cy.ts` | Sidebar navigation is visible | 🏠 Basic |
| 04 | `04-navigate-to-meetings.cy.ts` | Navigate to Meetings page | 🧭 Navigation |
| 05 | `05-navigate-to-calendar.cy.ts` | Navigate to Calendar page | 🧭 Navigation |
| 06 | `06-navigate-to-analytics.cy.ts` | Navigate to Analytics page | 🧭 Navigation |
| 07 | `07-navigate-to-summaries.cy.ts` | Navigate to AI Summaries page | 🧭 Navigation |
| 08 | `08-navigate-to-settings.cy.ts` | Navigate to Settings page | 🧭 Navigation |
| 09 | `09-dashboard-stats-visible.cy.ts` | Dashboard stat cards are visible | 📊 Dashboard |
| 10 | `10-dashboard-quick-actions.cy.ts` | Quick action buttons are visible | 📊 Dashboard |
| 11 | `11-meetings-search-visible.cy.ts` | Search input is visible | 📅 Meetings |
| 12 | `12-meetings-create-button.cy.ts` | Create meeting button is visible | 📅 Meetings |
| 13 | `13-meetings-filter-button.cy.ts` | Filter button is visible | 📅 Meetings |
| 14 | `14-meetings-search-functionality.cy.ts` | Search input accepts text | 📅 Meetings |
| 15 | `15-schedule-meeting-dialog.cy.ts` | Schedule meeting dialog opens | 💬 Dialogs |
| 16 | `16-filter-dialog.cy.ts` | Filter dialog opens | 💬 Dialogs |
| 17 | `17-schedule-free-day-dialog.cy.ts` | Schedule free day dialog opens | 💬 Dialogs |
| 18 | `18-time-blocks-dialog.cy.ts` | Time blocks dialog opens | 💬 Dialogs |
| 19 | `19-sidebar-active-state.cy.ts` | Sidebar highlights active page | 🎨 UI Components |
| 20 | `20-header-visible.cy.ts` | Header component is visible | 🎨 UI Components |
| 21 | `21-dashboard-recent-meetings.cy.ts` | Recent meetings section is visible | 📊 Dashboard |
| 22 | `22-dashboard-meeting-trends.cy.ts` | Meeting trends chart is visible | 📊 Dashboard |
| 23 | `23-sidebar-sections.cy.ts` | Sidebar navigation sections are visible | 🎨 UI Components |
| 24 | `24-sidebar-bottom-actions.cy.ts` | Bottom action buttons are visible | 🎨 UI Components |
| 25 | `25-url-navigation.cy.ts` | URL parameter navigation works | 🧭 Navigation |
| 26 | `26-close-dialog-with-escape.cy.ts` | Dialog closes with Escape key | ⌨️ Keyboard |
| 27 | `27-responsive-sidebar.cy.ts` | Sidebar displays on desktop viewport | 📱 Responsive |
| 28 | `28-dashboard-tip-of-the-day.cy.ts` | Tip of the day card is visible | 📊 Dashboard |
| 29 | `29-meetings-empty-state.cy.ts` | Empty state message displays | 📅 Meetings |
| 30 | `30-keyboard-navigation.cy.ts` | Search input can be focused | ⌨️ Keyboard |

## Test Categories

### 🏠 Basic (3 tests)
Essential functionality like page loading and basic visibility checks.

### 🧭 Navigation (6 tests)
Tests for navigating between different pages of the application.

### 📊 Dashboard (5 tests)
Tests for dashboard components, stats, and features.

### 📅 Meetings (5 tests)
Tests for the meetings page functionality.

### 💬 Dialogs (4 tests)
Tests for various dialog/modal interactions.

### 🎨 UI Components (4 tests)
Tests for UI components and their visual states.

### ⌨️ Keyboard (2 tests)
Tests for keyboard interactions and accessibility.

### 📱 Responsive (1 test)
Tests for responsive design behavior.

## Quick Commands

```bash
# Run all tests
npm run cypress:run

# Open Cypress GUI
npm run cypress:open

# Run tests in a specific category (example)
npx cypress run --spec "cypress/e2e/01-*.cy.ts,cypress/e2e/02-*.cy.ts,cypress/e2e/03-*.cy.ts"

# Run a specific test
npx cypress run --spec "cypress/e2e/01-page-loads.cy.ts"
```

## Test Design Principles

1. **One Test, One Purpose** - Each test focuses on a single piece of functionality
2. **Independent** - Tests can run in any order and don't depend on each other
3. **Simple** - Tests are easy to read and understand
4. **Fast** - Tests execute quickly by testing only what's necessary
5. **Maintainable** - Tests use semantic selectors (text content) when possible

## Adding New Tests

When adding a new test:

1. Create a new file with the next number: `31-your-test-name.cy.ts`
2. Follow the existing pattern:
   ```typescript
   describe('Feature Name', () => {
     it('should do one specific thing', () => {
       cy.visit('/')
       // Your test code
     })
   })
   ```
3. Keep it simple and focused
4. Update this document with the new test details

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Start dev server
  run: npm run dev &
  
- name: Wait for server
  run: npx wait-on http://localhost:3000 --timeout 60000

- name: Run Cypress tests
  run: npm run test:e2e
  
- name: Upload test artifacts
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: cypress-screenshots
    path: cypress/screenshots
```

## Performance

- **Total test count:** 30 tests
- **Estimated run time:** ~2-3 minutes (headless mode)
- **Coverage:** Basic UI functionality, navigation, and user interactions

## Maintenance Notes

- Tests use semantic selectors (text content) for better maintainability
- No test data setup required - tests work with the default app state
- Tests assume the app is running on http://localhost:3000
- Each test is isolated and doesn't modify application state

