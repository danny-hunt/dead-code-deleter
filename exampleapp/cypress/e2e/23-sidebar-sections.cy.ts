describe('Sidebar Sections', () => {
  it('should display navigation sections', () => {
    cy.visit('/')
    cy.contains('Main').should('be.visible')
    cy.contains('Insights').should('be.visible')
    cy.contains('Admin').should('be.visible')
  })
})

