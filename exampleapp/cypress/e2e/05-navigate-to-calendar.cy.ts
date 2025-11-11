describe('Navigate to Calendar', () => {
  it('should navigate to calendar page when clicking sidebar link', () => {
    cy.visit('/')
    cy.contains('Calendar').click()
    cy.contains('h1', 'Calendar').should('be.visible')
  })
})

