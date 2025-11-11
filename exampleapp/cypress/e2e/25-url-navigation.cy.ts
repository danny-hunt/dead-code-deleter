describe('URL Navigation', () => {
  it('should navigate to meetings page via URL parameter', () => {
    cy.visit('/?page=meetings')
    cy.contains('h1', 'Meetings').should('be.visible')
  })
})

