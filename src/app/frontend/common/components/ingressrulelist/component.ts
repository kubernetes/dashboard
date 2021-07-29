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

import {Component, Input, OnChanges, OnInit, SimpleChange} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {IngressSpecRule, IngressSpecRuleHttpPath, IngressSpecTLS} from '@api/root.api';
import {SupportedResources} from '@api/root.shared';
import _ from 'lodash';
import {GlobalServicesModule} from '../../services/global/module';
import {KdStateService} from '../../services/global/state';

interface IngressRuleFlat {
  host?: string;
  path: IngressSpecRuleHttpPath;
  tlsSecretName?: string;
}

interface IngressSpecTLSFlat {
  host: string;
  tlsSecretName: string;
}

@Component({
  selector: 'kd-ingressruleflat-card-list',
  templateUrl: './template.html',
})
export class IngressRuleFlatListComponent implements OnInit, OnChanges {
  @Input() initialized: boolean;
  @Input() ingressSpecRules: IngressSpecRule[];
  @Input() tlsList: IngressSpecTLS[];
  @Input() namespace: string;

  private readonly kdState_: KdStateService = GlobalServicesModule.injector.get(KdStateService);
  // Flat map of host -> secret name pairs.
  private tlsHostMap_ = new Map<string, string>();

  private get ingressRuleFlatList_(): IngressRuleFlat[] {
    return [].concat(
      ...this.ingressSpecRules.map(rule => {
        if (!rule.http) {
          return [] as IngressRuleFlat[];
        }

        return rule.http.paths.map(
          specPath =>
            ({
              host: rule.host || '',
              path: specPath,
              tlsSecretName: this.tlsHostMap_.get(rule.host) || '',
            } as IngressRuleFlat)
        );
      })
    );
  }

  ngOnInit(): void {
    this.tlsList = this.tlsList || [];
    this.ingressSpecRules = this.ingressSpecRules || [];
  }

  ngOnChanges(changes: {tlsList: SimpleChange}): void {
    if (changes.tlsList && changes.tlsList.currentValue) {
      this.tlsHostMap_.clear();
      []
        .concat(
          ...(changes.tlsList.currentValue as IngressSpecTLS[]).map(spec => {
            if (!_.isArray(spec.hosts)) {
              return [] as IngressSpecTLSFlat[];
            }

            return spec.hosts.map(
              host =>
                ({
                  host: host,
                  tlsSecretName: spec.secretName,
                } as IngressSpecTLSFlat)
            );
          })
        )
        .forEach((specFlat: IngressSpecTLSFlat) => this.tlsHostMap_.set(specFlat.host, specFlat.tlsSecretName));
    }
  }

  getIngressRulesFlatColumns(): string[] {
    return ['Host', 'Path', 'Path Type', 'Service Name', 'Service Port', 'TLS Secret'];
  }

  getDataSource(): MatTableDataSource<IngressRuleFlat> {
    return new MatTableDataSource<IngressRuleFlat>(this.ingressRuleFlatList_);
  }

  getDetailsHref(name: string, kind: string): string {
    return this.kdState_.href(kind, name, this.namespace);
  }

  isResourceSupported(sourceType: string): boolean {
    return SupportedResources.isSupported(sourceType);
  }
}
