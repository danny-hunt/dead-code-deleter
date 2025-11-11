describe('Navigate to Settings', () => {
  it('should navigate to settings page when clicking sidebar link', () => {
    cy.visit('/')
    cy.contains('Settings').click()
    cy.contains('h1', 'Settings').should('be.visible')
  })
})

