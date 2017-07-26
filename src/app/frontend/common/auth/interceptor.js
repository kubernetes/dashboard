// Copyright 2017 The Kubernetes Dashboard Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export class AuthInterceptor {
  constructor($cookies) {
    this.request = config => {
      // TODO: Better filtering for urls that do not require this token
      if (config.url.startsWith('api/v1')) {
        config.headers['kdToken'] = $cookies.get('kdToken');
      }

      return config;
    }
  }

  static NewAuthInterceptor($cookies) {
    return new AuthInterceptor($cookies)
  }
}