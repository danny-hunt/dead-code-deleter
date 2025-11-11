describe('Sidebar Bottom Actions', () => {
  it('should display invite team and logout buttons', () => {
    cy.visit('/')
    cy.contains('Invite Team').should('be.visible')
    cy.contains('Logout').should('be.visible')
  })
})

