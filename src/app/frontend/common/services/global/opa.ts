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

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable, Inject} from '@angular/core';
import {AppConfig} from '@api/backendapi';
import {VersionInfo} from '@api/frontendapi';
import {Observable} from 'rxjs/Observable';
import {version} from '../../../environments/version';
import {OpaDetail, OpaList} from 'typings/backendapi';
import {of} from 'rxjs';
import {getHeapSpaceStatistics} from 'v8';
import {ConfigService} from './config';
import {GlobalSettingsService} from './globalsettings';

@Injectable()
export class OpaService {
  private readonly configPath_ = 'config';
  opaList: OpaList = {
    listMeta: {
      totalItems: 0,
    },
    items: [],
  };
  constructor(
    @Inject(ConfigService) private config: ConfigService,
    private readonly http: HttpClient,
    private readonly settings_: GlobalSettingsService,
  ) {}

  init(): void {
    this.settings_.load(
      () => {
        this.config.getFileList().forEach(file => {
          this.readOpa(file).subscribe(config => {
            this.parseOpa(config);
          });
        });
      },
      () => {},
    );
  }

  readOpa(file: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.get('assets/config/' + file, {headers, responseType: 'text'});
  }

  getConfig(): Observable<OpaList> {
    return of(this.opaList);
  }

  parseOpa(opaFile: string): void {
    const msgList = opaFile.split('[msg]');

    msgList.forEach(msg => {
      msg = msg.replace('{', '');
      if (!msg.trim().startsWith('#')) {
        const kind = this.getKind(msg);
        const champ = this.getChamp(msg);
        const contrainte = this.getContrainte(msg);
        let index = -1;
        if (kind !== '' && champ !== '' && contrainte !== '') {
          this.opaList.items.forEach((item, i) => {
            if (kind === item.kind && champ === item.champ) {
              index = i;
            }
          });
          if (index !== -1) {
            this.opaList.items[index].contrainte.push(contrainte);
          } else {
            const opaDetail: OpaDetail = {
              objectMeta: {},
              typeMeta: {
                kind: 'Opa',
              },
              kind: '',
              champ: '',
              contrainte: [],
            };

            opaDetail.kind = kind;
            opaDetail.champ = champ;
            opaDetail.contrainte.push(contrainte);
            this.opaList.items.push(opaDetail);
          }
        }
      }
    });
  }

  getKind(msg: string): string {
    const kindList = msg.split('kind.kind');
    if (kindList.length > 1) {
      return kindList[1].split('"')[1];
    } else {
      return '';
    }
  }

  getContrainte(msg: string): string {
    const outList = msg.split('msg');
    if (outList.length > 1) {
      let output = outList[1].split('"')[1];
      output = output.replace('%v ', '');
      output = output.replace('%v', '');
      output = output.replace('%q', '');
      output = output.replace(':  ', '');
      output = output.replace('(utilisé : )', '');
      output = output.replace(': utilisé : )', '');
      return output;
    } else {
      return '';
    }
  }

  getChamp(msg: string): string {
    if (msg.includes('memory')) {
      return 'RAM';
    } else if (msg.includes('cpu')) {
      return 'CPU';
    } else if (msg.includes('sonde')) {
      return 'Sonde';
    } else if (msg.includes('image')) {
      return 'Image';
    } else if (msg.includes('IngressRoute')) {
      return 'Ingress';
    } else if (msg.includes('service')) {
      return 'Service';
    } else {
      return 'Autre';
    }
  }
}
