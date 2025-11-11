describe('Dashboard Meeting Trends', () => {
  it('should display meeting trends chart', () => {
    cy.visit('/')
    cy.contains('Meeting Trends').should('be.visible')
  })
})

