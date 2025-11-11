describe('Dashboard Visible', () => {
  it('should display the dashboard heading', () => {
    cy.visit('/')
    cy.contains('h1', 'Dashboard').should('be.visible')
  })
})

