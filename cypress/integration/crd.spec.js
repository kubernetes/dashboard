describe('Custom Resource Definitions', () => {
  it('crd list is initially empty', () => {
    cy.visit('/');

    cy.get('#sidebar-crd').click();
    cy.url().should('include', '/#/customresourcedefinition');

    cy.get('#zero-state').should('be.visible');
  });

  it('create a crd', () => {
    cy.fixture('crd.yaml').then(crd => {
      cy.createResource({content: crd});
      cy.reload();
    });
  });

  it('crd list should contain the new crd', () => {
    cy.get('#zero-state').should('not.be.visible');
    cy.get('kd-crd-list').within(() => {
      cy.get('mat-row').should('have.length', 1);
    });
  });

  it('go to crd details page', () => {
    cy.get('kd-crd-list').within(() => {
      cy.get('a')
        .first()
        .click();
    });
    cy.url().should(
      'include',
      '/#/customresourcedefinition/foos.samplecontroller.k8s.io?namespace=default',
    );

    // loads correctly
    cy.get('kd-object-meta').within(() => {
      cy.get('kd-property')
        .first()
        .contains('foos.samplecontroller.k8s.io');
    });

    // has resource information
    cy.get('#resource-information').within(() => {
      cy.get('kd-property').should('have.length', 3);

      cy.get('#resource-version')
        .contains('v1alpha1');
      cy.get('#resource-scope')
        .contains('Namespaced');
      cy.get('#resource-group')
        .contains('samplecontroller.k8s.io');
    });

    // has accepted names
    cy.get('#accepted-names').within(() => {
      cy.get('kd-property').should('have.length', 4);

      cy.get('kd-property')
        .eq(0)
        .contains('foos');
      cy.get('kd-property')
        .eq(1)
        .contains('foo');
      cy.get('kd-property')
        .eq(2)
        .contains('Foo');
      cy.get('kd-property')
        .eq(3)
        .contains('FooList');
    });

    // has empty object section
    cy.get('kd-crd-object-list').within(() => {
      cy.get('#zero-state').should('be.visible');
    });

    // has one version
    cy.get('kd-crd-versions-list').within(() => {
      cy.get('mat-row').should('have.length', 1);

      cy.get('mat-cell')
        .first()
        .contains('v1alpha1');
    });
  });

  it('create a crd object', () => {
    cy.fixture('example-foo.yaml').then(object => {
      cy.createResource({content: object, namespace: 'default'});
      cy.reload();
    });
  });

  it('crd objects list should contain the new object', () => {
    cy.get('kd-crd-object-list').within(() => {
      cy.get('#zero-state').should('not.be.visible');

      cy.get('mat-row').should('have.length', 1);
      cy.get('mat-cell')
        .first()
        .contains('example-foo');
    });
  });

  it('go to object detail page', () => {
    cy.get('kd-crd-object-list').within(() => {
      cy.get('a')
        .first()
        .click();
    });

    cy.url().should(
      'include',
      '/#/customresourcedefinition/foos.samplecontroller.k8s.io/default/example-foo?namespace=default',
    );

    cy.get('kd-object-meta').within(() => {
      // Name
      cy.get('kd-property')
        .eq(0)
        .contains('example-foo');

      // Namespace
      cy.get('kd-property')
        .eq(1)
        .contains('default');
    });
  });
});
