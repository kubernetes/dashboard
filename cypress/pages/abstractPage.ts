export class AbstractPage {
  static visitHome() {
    cy.visit('/');
  }

  static visit(url: string) {
    cy.visit(url);
  }

  //Get item by tag/#id/.class/tag.class/tag#id, optionally provide a contains arg
  static getItem(id: string, contains?: string): Cypress.Chainable<any> {
    if (contains) {
      return cy.get(id).contains(contains);
    }
    return cy.get(id);
  }

  //Click item by tag/#id/.class/tag.class/tag#id
  static clickItem(id: string, contains?: string) {
    if (contains) {
      this.getItem(id, contains).click();
    } else {
      this.getItem(id).click();
    }
  }

  static clickSelectorItem(option: string) {
    cy.get('mat-option').contains(option).click({force: true});
  }

  static assertUrlContains(url: string) {
    cy.url().should('contains', url);
  }

  static assertVisibility(id: string, visible: boolean) {
    // visible=true : Assert should be visible
    if (visible) {
      this.getItem(id).should('be.visible');
    }
    // visible=false : Assert not should be visible
    else {
      this.getItem(id).should('not.be.visible');
    }
  }
}
