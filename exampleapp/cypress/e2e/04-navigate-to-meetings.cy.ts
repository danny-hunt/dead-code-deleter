describe('Navigate to Meetings', () => {
  it('should navigate to meetings page when clicking sidebar link', () => {
    cy.visit('/')
    cy.contains('Meetings').click()
    cy.contains('h1', 'Meetings').should('be.visible')
    cy.contains('Manage all your scheduled meetings').should('be.visible')
  })
})

