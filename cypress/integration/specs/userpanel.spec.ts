import {UserpanelPage} from '../../pages/userpanelPage';

describe('Userpanel', () => {
  before(() => {
    UserpanelPage.visitHome();
  });

  it('check default namespace', () => {
    UserpanelPage.assertUrlContains('workloads');
  });

  it('collapses sidebar', () => {
    UserpanelPage.assertVisibility('mat-drawer', true);
    UserpanelPage.clickItem('kd-nav-hamburger');
    UserpanelPage.assertVisibility('mat-drawer', false);
  });

  it('home logo click overview redirect check', () => {
    UserpanelPage.clickItem('.kd-toolbar-logo-link');
    UserpanelPage.assertUrlContains('workloads');
  });

  it('add resource', () => {
    UserpanelPage.clickItem('mat-icon.kd-primary-toolbar-icon', 'add');
    UserpanelPage.assertUrlContains('create');
  });

  it('search', () => {
    const searchString = 'test_string';
    UserpanelPage.visitHome();
    UserpanelPage.typeSearch(searchString);
    UserpanelPage.assertUrlContains('q=' + searchString);
    UserpanelPage.visitHome();
  });
});
