describe('Dashboard Recent Meetings', () => {
  it('should display recent meetings section', () => {
    cy.visit('/')
    cy.contains('Recent Meetings').should('be.visible')
  })
})

