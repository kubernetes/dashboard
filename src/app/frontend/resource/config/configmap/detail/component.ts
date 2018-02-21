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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfigMapDetail} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Subscription} from 'rxjs/Subscription';

import {EndpointManager, Resource} from '../../../../common/services/resource/endpoint';
import {NamespacedResourceService} from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-config-map-detail',
  templateUrl: './template.html',
})
export class ConfigMapDetailComponent implements OnInit, OnDestroy {
  private configMapSubscription_: Subscription;
  private configMapName_: string;
  configMap: ConfigMapDetail;
  isInitialized = false;

  constructor(
      private readonly configMap_: NamespacedResourceService<ConfigMapDetail>,
      private readonly state_: StateService) {}

  ngOnInit(): void {
    this.configMapName_ = this.state_.params.resourceName;
    this.configMapSubscription_ =
        this.configMap_
            .get(EndpointManager.resource(Resource.configMap, true).detail(), this.configMapName_)
            .startWith({})
            .subscribe((d: ConfigMapDetail) => {
              this.configMap = d;
              this.isInitialized = true;
            });
  }

  ngOnDestroy(): void {
    this.configMapSubscription_.unsubscribe();
  }
}
