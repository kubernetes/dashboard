export class AbstractPage {
  static visitHome() {
    cy.visit('/');
  }
  static visit(url: string) {
    cy.visit(url);
  }
  //Get item by tag/#id/.class/tag.class/tag#id
  static getItem(id: string): Cypress.Chainable<any> {
    return cy.get(id);
  }
  //Click item by tag/#id/.class/tag.class/tag#id
  static clickItem(id: string) {
    this.getItem(id).click();
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
