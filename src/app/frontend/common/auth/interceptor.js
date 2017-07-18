export class AuthInterceptor {
  constructor($cookies) {
    this.request = config => {
      // TODO: Better filtering for urls that do not require this token
      if(config.url.startsWith('api/v1')) {
        config.headers['kdToken'] = $cookies.get('kdToken');
      }

      return config;
    }
  }

  static NewAuthInterceptor($cookies) {
    return new AuthInterceptor($cookies)
  }
}