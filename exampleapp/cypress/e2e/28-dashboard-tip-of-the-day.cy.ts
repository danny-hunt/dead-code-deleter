describe('Dashboard Tip of the Day', () => {
  it('should display tip of the day card', () => {
    cy.visit('/')
    cy.contains('Tip of the Day').should('be.visible')
  })
})

