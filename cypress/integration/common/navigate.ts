import {Given, When, Then} from 'cypress-cucumber-preprocessor/steps';

Given('I open {string} page', path => {
  switch (path) {
    case 'home':
      path = '/';
      break;
  }
  cy.visit(path);
});

Then('I see {string} in the url', text => {
  cy.url().should('include', text);
});

When('I click {string}', element => {
  switch (element) {
    case 'nav-cluster':
      element = '#nav-cluster';
      break;
    case 'nav-cluster-role-binding':
      element = '#nav-clusterrolebinding';
      break;
    case 'nav-cluster-role':
      element = '#nav-clusterrole';
      break;
    case 'nav-namespace':
      element = '#nav-namespace';
      break;
    case 'nav-node':
      element = '#nav-node';
      break;
    case 'nav-persistentvolume':
      element = '#nav-persistentvolume';
      break;
    case 'nav-storageclass':
      element = '#nav-storageclass';
      break;
  }
  cy.get(element).click();
});

Then('I see {string} in the title', text => {
  cy.title().should('include', text);
});

Then('I see {string} in the element {string}', (text, element) => {
  cy.get(element).contains(text);
});
