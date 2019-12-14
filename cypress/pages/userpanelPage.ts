import {AbstractPage} from './abstractPage';

export class UserpanelPage extends AbstractPage {
  static typeSearch(search: string) {
    this.getItem('input#search').type(search + '{enter}');
  }
}
