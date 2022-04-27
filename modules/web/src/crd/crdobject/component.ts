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

import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatButtonToggleGroup} from '@angular/material/button-toggle';
import {HttpClient} from '@angular/common/http';
import {dump as toYaml, load as fromYaml} from 'js-yaml';
import {Subject} from 'rxjs';
import {CRDObjectDetail} from '@api/root.api';
import {EditorMode} from '@common/components/textinput/component';
import {ActionbarService, ResourceMeta} from '@common/services/global/actionbar';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NotificationsService} from '@common/services/global/notifications';
import {RawResource} from '@common/resources/rawresource';
import {takeUntil} from 'rxjs/operators';

@Component({selector: 'kd-crd-object-detail', templateUrl: './template.html'})
export class CRDObjectDetailComponent implements OnInit, OnDestroy {
  @ViewChild('group', {static: true}) buttonToggleGroup: MatButtonToggleGroup;
  @ViewChild('code', {static: true}) codeRef: ElementRef;

  private readonly endpoint_ = EndpointManager.resource(Resource.crd, true);
  object: CRDObjectDetail;
  modes = EditorMode;
  isInitialized = false;
  selectedMode = EditorMode.YAML;
  text = '';
  eventListEndpoint: string;
  private unsubscribe_ = new Subject<void>();

  constructor(
    private readonly object_: NamespacedResourceService<CRDObjectDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly notifications_: NotificationsService,
    private readonly http_: HttpClient
  ) {}

  ngOnInit(): void {
    const {crdName, namespace, objectName} = this.activatedRoute_.snapshot.params;
    this.eventListEndpoint = this.endpoint_.child(`${crdName}/${objectName}`, Resource.event, namespace);

    this.object_
      .get(this.endpoint_.child(crdName, objectName, namespace))
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe((d: CRDObjectDetail) => {
        this.object = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta(d.typeMeta.kind, d.objectMeta, d.typeMeta));
        this.isInitialized = true;

        // Get raw resource
        const url = RawResource.getUrl(this.object.typeMeta, this.object.objectMeta);
        this.http_
          .get(url)
          .toPromise()
          .then(response => {
            if (this.selectedMode === EditorMode.YAML) {
              this.text = toYaml(response);
            } else {
              this.text = this.toRawJSON_(response);
            }
          });
      });

    this.buttonToggleGroup.valueChange.pipe(takeUntil(this.unsubscribe_)).subscribe((selectedMode: EditorMode) => {
      this.selectedMode = selectedMode;

      if (this.text) {
        this.updateText_();
      }
    });
  }

  getSelectedMode(): EditorMode {
    return this.selectedMode;
  }

  ngOnDestroy(): void {
    this.actionbar_.onDetailsLeave.emit();

    this.unsubscribe_.next();
    this.unsubscribe_.complete();
  }

  private updateText_(): void {
    if (this.selectedMode === EditorMode.YAML) {
      this.text = toYaml(JSON.parse(this.text));
    } else {
      this.text = this.toRawJSON_(fromYaml(this.text));
    }
  }

  private toRawJSON_(object: {}): string {
    return JSON.stringify(object, null, '\t');
  }
}
