describe('Close Dialog with Escape Key', () => {
  it('should close schedule meeting dialog when pressing escape key', () => {
    cy.visit('/')
    cy.contains('Meetings').click()
    cy.contains('Schedule Meeting').click()
    cy.contains('Schedule New Meeting').should('be.visible')
    
    // Press escape key
    cy.get('body').type('{esc}')
    
    // Dialog should be closed
    cy.contains('Schedule New Meeting').should('not.exist')
  })
})

