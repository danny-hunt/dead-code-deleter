describe('Keyboard Navigation', () => {
  it('should focus on search input when clicking it', () => {
    cy.visit('/')
    cy.contains('Meetings').click()
    cy.get('input[placeholder="Search meetings..."]').click()
    cy.focused().should('have.attr', 'placeholder', 'Search meetings...')
  })
})

