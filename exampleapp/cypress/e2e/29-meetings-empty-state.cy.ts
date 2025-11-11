describe('Meetings Empty State', () => {
  it('should show appropriate message when no meetings found', () => {
    cy.visit('/')
    cy.contains('Meetings').click()
    
    // Type a search that likely returns no results
    cy.get('input[placeholder="Search meetings..."]').type('nonexistentmeeting12345')
    
    // Should show no meetings found message
    cy.contains('No meetings found').should('be.visible')
  })
})

