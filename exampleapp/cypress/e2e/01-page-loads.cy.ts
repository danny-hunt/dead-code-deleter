describe('Page Loads', () => {
  it('should load the homepage successfully', () => {
    cy.visit('/')
    cy.contains('MeetingFlow').should('be.visible')
  })
})

