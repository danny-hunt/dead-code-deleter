describe('Header Visible', () => {
  it('should display the header component', () => {
    cy.visit('/')
    cy.get('header').should('be.visible')
  })
})

