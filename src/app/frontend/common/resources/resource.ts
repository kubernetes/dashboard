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

import {HttpClient} from '@angular/common/http';
import {Inject} from '@angular/core';
import {StateService} from '@uirouter/core';

import {RESOURCE_ENDPOINT_DI_TOKEN, ResourceEndpoint} from '../../index.config';

export abstract class ResourceBase<T> {
  protected namespace_: string;
  protected baseEndpoint_: string;

  constructor(
      @Inject(RESOURCE_ENDPOINT_DI_TOKEN) resourceEndpoint: ResourceEndpoint,
      protected readonly http_: HttpClient, private readonly state_: StateService) {
    this.baseEndpoint_ = resourceEndpoint.url;
  }

  getNamespace(): string {
    // TODO get from service
    return this.state_.params.namespace;
  }
}
