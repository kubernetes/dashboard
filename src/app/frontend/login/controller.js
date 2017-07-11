
/**
 * @final
 */
export class LoginController {
  /**
   * @param {!./../chrome/nav/nav_service.NavService} kdNavService
   * @ngInject
   */
  constructor(kdNavService, kdAuthService, $state, loginStatus) {
    /** @private {!./../chrome/nav/nav_service.NavService} */
    this.kdNavService_ = kdNavService;
    this.kdAuthService_ = kdAuthService;
    this.state_ = $state;
    console.log(loginStatus);

    /**
     * Hide side menu while entering login page.
     */
    this.kdNavService_.setVisibility(false);

    /**
     * Initialized from the template.
     * @export {!angular.FormController}
     */
    this.form;

    // this.username;
    // this.password;
  }

  /**
   * @export
   */
  logIn() {}

  /**
   * @export
   */
  skip() {
    this.kdAuthService_.disableLoginPage(true);
    this.state_.reload();
  }
}