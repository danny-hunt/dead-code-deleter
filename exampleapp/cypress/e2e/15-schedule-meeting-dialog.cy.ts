describe('Schedule Meeting Dialog', () => {
  it('should open dialog when clicking schedule meeting button', () => {
    cy.visit('/')
    cy.contains('Meetings').click()
    cy.contains('Schedule Meeting').click()
    cy.contains('Schedule New Meeting').should('be.visible')
  })
})

