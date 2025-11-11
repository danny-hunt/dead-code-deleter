# Cypress Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The app should be running at http://localhost:3000

### 3. Run Tests

**Interactive Mode (Recommended for Development):**
```bash
npm run cypress:open
```
This opens the Cypress Test Runner where you can:
- Select and run individual tests
- Watch tests execute in a real browser
- Debug tests easily
- See detailed logs and screenshots

**Headless Mode (CI/CD):**
```bash
npm run cypress:run
```
Runs all tests in headless mode and outputs results to the terminal.

## Test Organization

All tests are located in `cypress/e2e/` directory. Each test file:
- Tests a single, small piece of functionality
- Is numbered sequentially (01, 02, 03...)
- Has a descriptive name indicating what it tests
- Can be run independently

## Test Categories

### 🏠 Basic Functionality (Tests 1-3)
- Page loading
- Dashboard visibility
- Sidebar visibility

### 🧭 Navigation (Tests 4-8, 25)
- Navigation between pages via sidebar
- URL parameter navigation

### 📊 Dashboard (Tests 9-10, 21-22)
- Stats display
- Quick actions
- Recent meetings
- Meeting trends

### 📅 Meetings Page (Tests 11-16)
- Search functionality
- Create meeting button
- Filter functionality
- Dialog interactions

### 💬 Dialogs (Tests 15-18)
- Schedule meeting dialog
- Filter dialog
- Schedule free day dialog
- Time blocks dialog

### 🎨 UI Components (Tests 19-20, 23-24)
- Sidebar active state
- Header visibility
- Sidebar sections
- Bottom action buttons

## Example: Running a Single Test

```bash
# Run just the page loads test
npx cypress run --spec "cypress/e2e/01-page-loads.cy.ts"

# Run multiple specific tests
npx cypress run --spec "cypress/e2e/01-*.cy.ts,cypress/e2e/02-*.cy.ts"
```

## Writing New Tests

Keep tests simple and focused:

```typescript
describe('Feature Name', () => {
  it('should do one specific thing', () => {
    cy.visit('/')
    cy.contains('Expected Text').should('be.visible')
  })
})
```

## Troubleshooting

### Tests are failing
1. Make sure the dev server is running on port 3000
2. Check that you can manually access http://localhost:3000
3. Clear Cypress cache: `npx cypress cache clear`

### Port 3000 is already in use
Either:
- Stop the process using port 3000
- Update `baseUrl` in `cypress.config.ts` to match your dev server port

### Tests are slow
- Use headless mode: `npm run cypress:run`
- Run specific tests instead of all tests
- Check your network connection

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Start dev server
  run: npm run dev &
  
- name: Wait for server
  run: npx wait-on http://localhost:3000

- name: Run Cypress tests
  run: npm run test:e2e
```

## Additional Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress API](https://docs.cypress.io/api/table-of-contents)

