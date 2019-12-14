export class NavbarPage {
  static visitHome() {
    cy.visit('/');
  }
  static visit(url: string) {
    cy.visit(url);
  }
  static clickSelectorItem(option: string) {
    cy.get('mat-option')
      .contains(option)
      .click();
  }
  static getKdNavItemById(id: string): Cypress.Chainable<any> {
    return cy.get(id);
  }
  static clickNavItemById(id: string) {
    this.getKdNavItemById(id).click();
  }

  static assertUrlContains(url: string) {
    cy.url().should('contains', url);
  }
}
