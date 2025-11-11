describe('Meetings Create Button', () => {
  it('should display schedule meeting button', () => {
    cy.visit('/')
    cy.contains('Meetings').click()
    cy.contains('Schedule Meeting').should('be.visible')
  })
})

