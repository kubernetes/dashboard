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

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ResourceService} from '../resource/resource';
import {NamespaceList, PodList} from '@api/root.api';
import {EndpointManager, Resource} from '../resource/endpoint';
import {NotificationsService} from './notifications';
import {Router} from '@angular/router';
import {first} from 'rxjs/operators';

@Injectable()
export class PermissionsService {
  private firstNs: string;
  private nsList: string[];
  private readonly endpoint_ = EndpointManager.resource(Resource.namespace);

  constructor(
    private readonly namespace_: ResourceService<NamespaceList>,
    private readonly notifications_: NotificationsService,
    private readonly podList_: ResourceService<PodList>,
  ) {}

  init(): void {}

  getNs(): Observable<NamespaceList> {
    return this.namespace_.get(this.endpoint_.list());
  }

  random(): void {}

  getNsList(): string[] {
    return this.nsList;
  }

  getFirstNs(): string {
    return this.firstNs;
  }

  //Redirects to the first namespace that the user is allowed to
  redirectToNs(state_: Router): void {
    this.getNs()
      .pipe(first())
      .subscribe(namespaceList => {
        let redirection = false;
        this.nsList = namespaceList.namespaces.map(n => n.objectMeta.name);

        if (namespaceList.errors.length > 0) {
          for (const err of namespaceList.errors) {
            this.notifications_.pushErrors([err]);
          }
        }

        for (const ns of this.nsList) {
          this.podList_
            .get('api/v1/pod/' + ns)
            .pipe(first())
            .subscribe(
              podList => {
                if (podList.errors.length === 0 && redirection === false) {
                  redirection = true;
                  //console.log("Redirecting to " + ns)
                  state_.navigate(['overview'], {queryParams: {namespace: ns}});
                }
              },
              () => {},
              () => {},
            );
        }
      });
  }
}
