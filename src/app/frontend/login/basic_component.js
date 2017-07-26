
class BasicLoginController {
  constructor() {
    this.loginOptionsCtrl;
    this.selected = false;
  }

  $onInit() {
    this.loginOptionsCtrl.addOption(this);
  }

  onUsernameUpdate() {
    this.onUpdate({loginSpec: {username: this.username}})
  }

  onPasswordUpdate() {
    this.onUpdate({loginSpec: {password: this.password}})
  }
}

export const basicLoginComponent = {
  templateUrl: 'login/basic.html',
  require: {
    'loginOptionsCtrl': '^kdLoginOptions',
  },
  bindings: {
    'title': '@',
    'onUpdate': '&',
  },
  controller: BasicLoginController,
};
