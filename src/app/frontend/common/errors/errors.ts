// Copyright 2017 The Kubernetes Authors.
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

import { ErrStatus, K8sError as K8SApiError } from '@api/backendapi';
import { KdError as KdApiError, KnownErrors } from '@api/frontendapi';

/* tslint:disable */
/**
 * Error returned as a part of backend api calls. All server errors should be in this format.
 */
export class K8SError implements K8SApiError {
  ErrStatus: ErrStatus;
}
/* tslint:enable */

/**
 * Frontend specific errors or errors transformed based on server response.
 */
export class KdError implements KdApiError {
  constructor(
    public status: string,
    public code: number,
    public message: string
  ) {}
}

export const KNOWN_ERRORS: KnownErrors = {
  unauthorized: new KdError('Unauthorized', 401, 'Not allowed.'),
};
