
class TokenLoginController {
  constructor() {
    this.loginOptionsCtrl;
    this.selected = false;
  }

  $onInit() {
    this.loginOptionsCtrl.addOption(this);
  }

  onTokenUpdate() {
    this.onUpdate({loginSpec: {token: this.token}})
  }
}

export const tokenLoginComponent = {
  templateUrl: 'login/token.html',
  require: {
    'loginOptionsCtrl': '^kdLoginOptions',
  },
  bindings: {
    'title': '@',
    'onUpdate': '&',
  },
  controller: TokenLoginController,
};