// User story of creating new resource from input
describe('Create resource from Input', () => {
  it("Click on  + 'Add resource' button in userpanel", () => {
    cy.visit("/");
    cy.get("mat-icon.kd-primary-toolbar-icon").contains('add').click();
    cy.url().should('include', '/create')
  });
  it('upload button disabled',()=>{
    cy.get("#upload").should('not.be.enabled');
  });
  it('click cancel', () => {
    cy.get("#cancel").click();
    cy.url().should('contains', '/overview');
  });
  it('Check sample create/upload', () => {
    cy.visit("/");
    cy.get("mat-icon.kd-primary-toolbar-icon").contains('add').click();
    cy.url().should('include', '/create');
    cy.fixture('sample-nginx-dep.yaml').then(object => {
      cy.get("ace-editor").click();
      let lines = object.toString().split("\n");
      console.log(lines);
      for (var line of lines) {
        cy.focused().type(line+'{enter}');
      }
    });
    cy.get("#upload").click();
    cy.url().should('contains', '/overview');
  });
});
