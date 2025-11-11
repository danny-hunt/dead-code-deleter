describe('Sidebar Visible', () => {
  it('should display the sidebar with navigation items', () => {
    cy.visit('/')
    cy.contains('Dashboard').should('be.visible')
    cy.contains('Meetings').should('be.visible')
    cy.contains('Calendar').should('be.visible')
  })
})

