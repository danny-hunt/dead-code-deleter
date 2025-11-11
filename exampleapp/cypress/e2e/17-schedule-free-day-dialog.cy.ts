describe('Schedule Free Day Dialog', () => {
  it('should open dialog when clicking schedule meeting-free day button', () => {
    cy.visit('/')
    cy.contains('Schedule Meeting-Free Day').click()
    cy.contains('Schedule a Meeting-Free Day').should('be.visible')
  })
})

