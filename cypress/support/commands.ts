// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// add a custom command cy.foo()
// Cypress.Commands.add('foo', () => 'foo')
//
// // see more example of adding custom commands to Cypress TS interface
// // in https://github.com/cypress-io/add-cypress-custom-command-in-typescript
// // add new command to the existing Cypress interface
// // tslint:disable-next-line no-namespace
// declare namespace Cypress {
//   // tslint:disable-next-line interface-name
//   interface Chainable {
//     foo: () => string
//   }
// }

Cypress.Commands.add(
  'createResource',
  ({resource = '', name = '', namespace = '', content = ''}) => {
    return getCsrfToken('appdeploymentfromfile').then(response => {
      const {token} = response.body;

      return cy.request({
        url: '/api/v1/appdeploymentfromfile',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        body: {
          name,
          namespace,
          resource,
          content,
        },
      });
    });
  },
);

function getCsrfToken(action) {
  return cy.request({
    url: `api/v1/csrftoken/${action}`,
    method: 'GET',
  });
}
