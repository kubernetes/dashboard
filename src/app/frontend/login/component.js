/**
 * @final
 */
class LoginController {
  /**
   * @param {!./../chrome/nav/nav_service.NavService} kdNavService
   * @ngInject
   */
  constructor(kdNavService, kdAuthService, $state) {
    /** @private {!./../chrome/nav/nav_service.NavService} */
    this.kdNavService_ = kdNavService;
    this.kdAuthService_ = kdAuthService;
    this.state_ = $state;

    /**
     * Hide side menu while entering login page.
     */
    this.kdNavService_.setVisibility(false);

    /**
     * Initialized from the template.
     * @export {!angular.FormController}
     */
    this.form;

    this.username = 'floreks';
    this.password = 'password';
  }

  /**
   * @export
   */
  logIn() {
    this.kdAuthService_.logIn({username: this.username, password: this.password}).then(
        () => {
          this.kdNavService_.setVisibility(true);
          this.state_.transitionTo('workload');
        },
        err => {
          console.log(err);
        }
    )
  }

  /**
   * @export
   */
  skip() {
    this.kdAuthService_.skipLoginPage(true);
    this.kdNavService_.setVisibility(true);
    this.state_.transitionTo('workload');
  }

  invalidate() {
    this.kdAuthService_.skipLoginPage(false);
  }
}

export const loginComponent = {
  templateUrl: 'login/login.html',
  controller: LoginController,
};
