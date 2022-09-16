/*
 * Copyright 2017 The Kubernetes Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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
