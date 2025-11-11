# Cypress E2E Tests

This directory contains end-to-end (E2E) tests for the MeetingFlow application using Cypress.

## Test Structure

Each test is in its own file and tests a small, focused piece of functionality. Tests are numbered sequentially for easy identification.

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure the development server is running:
   ```bash
   npm run dev
   ```

### Running Tests

**Open Cypress Test Runner (Interactive Mode):**
```bash
npm run cypress:open
```
This opens the Cypress GUI where you can run individual tests and see them execute in the browser.

**Run All Tests (Headless Mode):**
```bash
npm run cypress:run
# or
npm run test:e2e
```
This runs all tests in headless mode and outputs results to the terminal.

**Run Tests with Browser Visible:**
```bash
npm run test:e2e:headed
```

**Run a Specific Test:**
```bash
npx cypress run --spec "cypress/e2e/01-page-loads.cy.ts"
```

## Test Coverage

The tests cover the following functionality:

### Basic Navigation
- `01-page-loads.cy.ts` - Page loads successfully
- `02-dashboard-visible.cy.ts` - Dashboard is visible
- `03-sidebar-visible.cy.ts` - Sidebar navigation is visible

### Page Navigation
- `04-navigate-to-meetings.cy.ts` - Navigate to Meetings page
- `05-navigate-to-calendar.cy.ts` - Navigate to Calendar page
- `06-navigate-to-analytics.cy.ts` - Navigate to Analytics page
- `07-navigate-to-summaries.cy.ts` - Navigate to AI Summaries page
- `08-navigate-to-settings.cy.ts` - Navigate to Settings page
- `25-url-navigation.cy.ts` - URL parameter navigation

### Dashboard
- `09-dashboard-stats-visible.cy.ts` - Dashboard stats are visible
- `10-dashboard-quick-actions.cy.ts` - Quick action buttons are visible
- `21-dashboard-recent-meetings.cy.ts` - Recent meetings section
- `22-dashboard-meeting-trends.cy.ts` - Meeting trends chart

### Meetings Page
- `11-meetings-search-visible.cy.ts` - Search input is visible
- `12-meetings-create-button.cy.ts` - Create meeting button is visible
- `13-meetings-filter-button.cy.ts` - Filter button is visible
- `14-meetings-search-functionality.cy.ts` - Search input functionality
- `15-schedule-meeting-dialog.cy.ts` - Schedule meeting dialog opens
- `16-filter-dialog.cy.ts` - Filter dialog opens

### Dialogs
- `17-schedule-free-day-dialog.cy.ts` - Schedule free day dialog
- `18-time-blocks-dialog.cy.ts` - Time blocks dialog

### UI Components
- `19-sidebar-active-state.cy.ts` - Sidebar active state highlighting
- `20-header-visible.cy.ts` - Header component visibility
- `23-sidebar-sections.cy.ts` - Sidebar navigation sections
- `24-sidebar-bottom-actions.cy.ts` - Sidebar bottom action buttons

## Adding New Tests

When adding new tests:

1. Create a new file in `cypress/e2e/` with a descriptive name
2. Use the next sequential number (e.g., `26-new-test.cy.ts`)
3. Keep each test simple and focused on one piece of functionality
4. Follow the existing test structure with `describe()` and `it()` blocks
5. Update this README with the new test description

## Configuration

The Cypress configuration is in `cypress.config.ts` at the project root. Key settings:

- **baseUrl**: `http://localhost:3000` - The app must be running on this port
- **viewportWidth**: `1280` - Default viewport width
- **viewportHeight**: `720` - Default viewport height

## Tips

- Tests assume the app is running on `http://localhost:3000`
- Each test is independent and can run in isolation
- Tests use semantic selectors (text content) for better maintainability
- If a test fails, check that the app is running and accessible

