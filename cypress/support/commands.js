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
