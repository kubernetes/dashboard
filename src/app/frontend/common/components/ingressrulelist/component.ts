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

import {Component, Input} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {IngressSpecRule, IngressSpecRuleHttpPath, IngressSpecTls} from '@api/root.api';
import {KdStateService} from '../../services/global/state';
import {GlobalServicesModule} from '../../services/global/module';

interface IngressRuleFlat {
  host?: string;
  path: IngressSpecRuleHttpPath;
  tlsSecretName?: string;
}

@Component({
  selector: 'kd-ingressruleflat-card-list',
  templateUrl: './template.html',
})
export class IngressRuleFlatListComponent {
  @Input() initialized: boolean;
  @Input() ingressSpecRules: IngressSpecRule[] = [];
  @Input() tlsList: IngressSpecTls[] = [];
  @Input() namespace: string;

  private readonly kdState_: KdStateService = GlobalServicesModule.injector.get(KdStateService);

  getIngressRulesFlatColumns(): string[] {
    return ['Host', 'Path', 'Path Type', 'Service Name', 'Service Port', 'TLS Secret'];
  }

  ingressSpecRuleToIngressRuleFlat(ingressSpecRules: IngressSpecRule[], tlsList: IngressSpecTls[]): IngressRuleFlat[] {
    const ingressRuleList = [].concat(
      ...ingressSpecRules.map(rule =>
        rule.http.paths.map(
          specPath =>
            ({
              host: rule.host || '',
              path: specPath,
            } as IngressRuleFlat)
        )
      )
    ) as IngressRuleFlat[];

    ingressRuleList.forEach((ingressRule, _) => {
      tlsList.forEach((tls, _) => {
        tls.hosts.forEach((tlsHost, _) => {
          if (tlsHost === ingressRule.host) {
            ingressRule.tlsSecretName = tls.secretName;
          }
        });
      });
    });

    return ingressRuleList;
  }

  getDataSource(): MatTableDataSource<IngressRuleFlat> {
    const tableData = new MatTableDataSource<IngressRuleFlat>();
    tableData.data = this.ingressSpecRuleToIngressRuleFlat(this.ingressSpecRules || [], this.tlsList || []);

    return tableData;
  }

  getDetailsHref(name: string, kind: string): string {
    return this.kdState_.href(kind, name, this.namespace);
  }
}
