/** @final **/
export default class LoginSpec {
  /**
   * @return {!backendApi.LoginSpec}
   */
  constructor({username = '', password = '', token = '', kubeConfig = ''} = {username: '', password: '', token: '', kubeConfig: ''}) {
    /** @private {string} */
    this.username = username;
    /** @private {string} */
    this.password = password;
    /** @private {string} */
    this.token = token;
    /** @private {string} */
    this.kubeConfig = kubeConfig;
  }
}
