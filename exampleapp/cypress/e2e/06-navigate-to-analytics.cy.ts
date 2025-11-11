describe('Navigate to Analytics', () => {
  it('should navigate to analytics page when clicking sidebar link', () => {
    cy.visit('/')
    cy.contains('Analytics').click()
    cy.contains('h1', 'Analytics').should('be.visible')
  })
})

