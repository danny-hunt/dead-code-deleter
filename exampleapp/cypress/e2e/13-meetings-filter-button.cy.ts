describe('Meetings Filter Button', () => {
  it('should display filter button on meetings page', () => {
    cy.visit('/')
    cy.contains('Meetings').click()
    cy.contains('button', 'Filter').should('be.visible')
  })
})

