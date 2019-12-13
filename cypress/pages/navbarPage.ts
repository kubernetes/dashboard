
export class NavbarPage {
  private static getId(id:string){
    return '#'+id;
  }
  static visit() {
    cy.visit("/");
  }
  static getKdNavItemById(id: string): Cypress.Chainable<any> {
    return cy.get(this.getId(id));
  }
  static clickNavItemById(id: string) {
    this.getKdNavItemById(id).click()
  }

  static assertUrlContains(url: string) {
    cy.url().should('contains', url);
  }
}
