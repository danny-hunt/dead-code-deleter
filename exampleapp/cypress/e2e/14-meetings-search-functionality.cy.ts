describe('Meetings Search Functionality', () => {
  it('should allow typing in the search input', () => {
    cy.visit('/')
    cy.contains('Meetings').click()
    cy.get('input[placeholder="Search meetings..."]')
      .type('test meeting')
      .should('have.value', 'test meeting')
  })
})

