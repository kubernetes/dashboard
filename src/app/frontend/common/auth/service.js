
/**
 * @final
 */
export class AuthService {
  /**
   * @ngInject
   */
  constructor($cookies) {
    this.cookies_ = $cookies;

    this.jwtCookie = "kdToken";
    this.authHeaderPresent = false;
    this.loginEnabled = true;
  }

  isLoggedIn() {
    return this.cookies_.get(this.jwtCookie) !== undefined;
  }

  isAuthHeaderPresent() {
    return this.authHeaderPresent;
  }

  setAuthHeaderPresent(isPresent) {
    this.authHeaderPresent = isPresent;
  }

  disableLoginPage(disable) {
    this.loginEnabled = !disable;
  }

  isLoginPageEnabled() {
    return this.loginEnabled;
  }
}