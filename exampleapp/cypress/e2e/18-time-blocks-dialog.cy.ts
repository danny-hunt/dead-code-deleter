describe('Time Blocks Dialog', () => {
  it('should open dialog when clicking review time blocks button', () => {
    cy.visit('/')
    cy.contains('Review Time Blocks').click()
    cy.contains('Time Blocks Overview').should('be.visible')
  })
})

