describe("Application", () => {
    before(() => {
        cy.visit("/");
    });

    it("visits 'default' namespace", () => {
        cy.url().should('include', 'overview?namespace=default');
    });

    it("collapses sidebar", () => {
        cy.get("mat-drawer").should("be.visible");
        cy.get("kd-nav-hamburger").click();
        cy.get("mat-drawer").should('not.be.visible');
    })
});
