describe('Meetings Search Visible', () => {
  it('should display search input on meetings page', () => {
    cy.visit('/')
    cy.contains('Meetings').click()
    cy.get('input[placeholder="Search meetings..."]').should('be.visible')
  })
})

