export class AbstractPage {
  static visitHome() {
    cy.visit('/');
  }
  static visit(url: string) {
    cy.visit(url);
  }
  static getItemById(id: string): Cypress.Chainable<any> {
    return cy.get(id);
  }
  static clickItemById(id: string) {
    this.getItemById(id).click();
  }
  static assertUrlContains(url: string) {
    cy.url().should('contains', url);
  }
  static clickSelectorItem(option: string) {
    cy.get('mat-option')
      .contains(option)
      .click();
  }
}
