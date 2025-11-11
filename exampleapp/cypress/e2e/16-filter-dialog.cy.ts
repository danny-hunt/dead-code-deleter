describe('Filter Dialog', () => {
  it('should open filter dialog when clicking filter button', () => {
    cy.visit('/')
    cy.contains('Meetings').click()
    cy.contains('button', 'Filter').click()
    cy.contains('Filter Meetings').should('be.visible')
  })
})

