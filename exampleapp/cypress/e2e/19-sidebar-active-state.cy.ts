describe('Sidebar Active State', () => {
  it('should highlight the active page in the sidebar', () => {
    cy.visit('/')
    // Dashboard should be active by default
    cy.contains('button', 'Dashboard').should('have.class', 'bg-primary')
    
    // Navigate to meetings and check active state
    cy.contains('Meetings').click()
    cy.contains('button', 'Meetings').should('have.class', 'bg-primary')
  })
})

