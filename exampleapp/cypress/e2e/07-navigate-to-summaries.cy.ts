describe('Navigate to AI Summaries', () => {
  it('should navigate to AI Summaries page when clicking sidebar link', () => {
    cy.visit('/')
    cy.contains('AI Summaries').click()
    cy.contains('h1', 'AI Summaries').should('be.visible')
  })
})

