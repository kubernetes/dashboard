import {UserpanelPage} from '../../pages/userpanelPage';

describe('Userpanel', () => {
  before(() => {
    UserpanelPage.visitHome();
  });
  describe('Basic tests', () => {
    it('check default namespace', () => {
      UserpanelPage.assertUrlContains('overview?namespace=default');
    });
    it('collapses sidebar', () => {
      UserpanelPage.assertVisibility('mat-drawer', true);
      UserpanelPage.clickItem('kd-nav-hamburger');
      UserpanelPage.assertVisibility('mat-drawer', false);
    });
    it('home logo click overview redirect check', () => {
      UserpanelPage.clickItem('.kd-toolbar-logo-link');
      UserpanelPage.assertUrlContains('overview');
    });
    it('add resource', () => {
      UserpanelPage.clickItem('mat-icon.kd-primary-toolbar-icon', 'add');
      UserpanelPage.assertUrlContains('create');
    });
    it('search', () => {
      UserpanelPage.visitHome();
      UserpanelPage.typeSearch('test_string');
      UserpanelPage.assertUrlContains('q=test_string');
      UserpanelPage.visitHome();
    });
  });
});
