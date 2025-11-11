describe('Dashboard Quick Actions', () => {
  it('should display quick action buttons', () => {
    cy.visit('/')
    cy.contains('Quick Actions').should('be.visible')
    cy.contains('Schedule Meeting-Free Day').should('be.visible')
    cy.contains('Review Time Blocks').should('be.visible')
    cy.contains('Export Weekly Report').should('be.visible')
  })
})

