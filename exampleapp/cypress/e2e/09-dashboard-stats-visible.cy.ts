describe('Dashboard Stats Visible', () => {
  it('should display stat cards on the dashboard', () => {
    cy.visit('/')
    cy.contains('Meetings This Week').should('be.visible')
    cy.contains('Time in Meetings').should('be.visible')
  })
})

