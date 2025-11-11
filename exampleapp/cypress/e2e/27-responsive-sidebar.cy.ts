describe('Responsive Sidebar', () => {
  it('should display sidebar on desktop viewport', () => {
    cy.viewport(1280, 720)
    cy.visit('/')
    cy.contains('MeetingFlow').should('be.visible')
  })
})

