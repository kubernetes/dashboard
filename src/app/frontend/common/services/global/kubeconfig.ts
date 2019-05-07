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

import {Inject, Injectable, NgZone} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {SessionStorageService} from 'ngx-webstorage';
import * as _ from 'lodash';
import {load as loadYaml, dump as dumpYaml} from 'js-yaml';

import {AsKdError, K8SError} from '../../errors/errors';
import {AuthService} from './authentication';
import {PluginsConfigService} from './plugin';
import {LoginSpec, Cluster, Context, Kubeconfig, User, DefaultUserName} from '@api/backendapi';
import {KdError} from '@api/frontendapi';
import {Config, CONFIG_DI_TOKEN} from '../../../index.config';

import camelcaseKeys = require('camelcase-keys');

const camelcaseOpts = {deep: true};
const decamelizeKeys = ['currentContext', 'certificate-authority-data'];

@Injectable()
export class KubeconfigService {
  errors: KdError[] = [];
  configYaml = '';

  constructor(
    private readonly authService_: AuthService,
    private readonly pluginConfigService_: PluginsConfigService,
    private readonly ngZone_: NgZone,
    private readonly cookies_: CookieService,
    private readonly sessionStorage_: SessionStorageService,
    private readonly router_: Router,
    @Inject(CONFIG_DI_TOKEN) private readonly CONFIG: Config,
  ) {}

  getConfigYaml(): string {
    return this.configYaml;
  }

  createKubeconfig(configYaml: string): Kubeconfig {
    // Convert to Kubeconfig object and convert keys to camelcase
    const kubeconfigOrg = camelcaseKeys(loadYaml(configYaml), camelcaseOpts) as Kubeconfig;
    const kubeconfig: Kubeconfig = {
      clusters: [],
      contexts: [],
      currentContext: '',
      users: [],
    };

    // Remove unused properties from kubeconfig
    kubeconfigOrg.clusters.map(cluster => {
      kubeconfig.clusters.push({
        name: cluster.name,
        cluster: {
          certificateAuthorityData: cluster.cluster.certificateAuthorityData,
          server: cluster.cluster.server,
          sidecarHost: cluster.cluster.sidecarHost,
        },
      } as Cluster);
      return cluster;
    });
    kubeconfigOrg.users.map(user => {
      kubeconfig.users.push({
        name: user.name,
      } as User);
      return user;
    });
    kubeconfigOrg.contexts.map(context => {
      kubeconfig.contexts.push({
        name: context.name,
        context: {
          cluster: context.context.cluster,
          user: context.context.user,
          namespace: context.context.namespace,
        },
      } as Context);
      return context;
    });
    kubeconfig.currentContext = kubeconfigOrg.currentContext;
    return kubeconfig;
  }

  setKubeconfig(configYaml: string): void {
    if (!configYaml) {
      return null;
    }

    this.configYaml = configYaml;
    const kubeconfig = this.createKubeconfig(configYaml);

    this.sessionStorage_.store(this.CONFIG.kubeconfigSessionStorageName, JSON.stringify(kubeconfig));
    this.cookies_.set(
      this.CONFIG.certificateAuthorityDataCookieName,
      this.getCurrentCertificateAuthorityData(),
      null,
      null,
      null,
      false,
      'Strict',
    );
    this.cookies_.set(this.CONFIG.serverCookieName, this.getCurrentServer(), null, null, null, false, 'Strict');
    this.cookies_.set(
      this.CONFIG.sidecarHostCookieName,
      this.getCurrentSidecarHost(),
      null,
      null,
      null,
      false,
      'Strict',
    );
  }

  clearKubeconfig(): void {
    // Clear kubeconfig from session storage
    this.sessionStorage_.clear(this.CONFIG.kubeconfigSessionStorageName);
    this.cookies_.delete(this.CONFIG.certificateAuthorityDataCookieName, null, null, false, 'Strict');
    this.cookies_.delete(this.CONFIG.serverCookieName, null, null, false, 'Strict');
    this.cookies_.delete(this.CONFIG.sidecarHostCookieName, null, null, false, 'Strict');
    const userNames = JSON.parse(this.cookies_.get(this.CONFIG.userNamesCookieName) || '[]');
    for (const userName of userNames) {
      this.cookies_.delete(this.CONFIG.authTokenCookieName + '-' + userName);
    }
    this.cookies_.delete(this.CONFIG.userNamesCookieName, null, null, false, 'Strict');
  }

  getKubeconfig(): Kubeconfig | null {
    // Load kubeconfig YAML from session storage
    const kubeconfig = this.sessionStorage_.retrieve(this.CONFIG.kubeconfigSessionStorageName) as string;
    if (!kubeconfig) {
      return null;
    }
    // Convert to Kubeconfig object and convert keys to camelcase
    return camelcaseKeys(loadYaml(kubeconfig), camelcaseOpts);
  }

  getContexts(): string[] {
    const kubeconfig = this.getKubeconfig();
    if (!kubeconfig) {
      return [];
    }
    return kubeconfig.contexts.map(ctx => {
      return ctx.name;
    });
  }

  getCurrentContext(): string {
    const kubeconfig = this.getKubeconfig();
    if (!kubeconfig) {
      return '';
    }
    return kubeconfig.currentContext;
  }

  getContext(contextName: string): Context | null {
    const kubeconfig = this.getKubeconfig();
    if (!kubeconfig) {
      return null;
    }
    const contexts = kubeconfig.contexts.filter(ctx => {
      return ctx.name === contextName;
    });
    if (_.isEmpty(contexts)) {
      return null;
    }
    return contexts[0];
  }

  getCluster(name: string): Cluster {
    const kubeconfig = this.getKubeconfig();
    if (!kubeconfig) {
      return null;
    }
    const clusters = kubeconfig.clusters.filter(cluster => {
      return cluster.name === name;
    });
    if (_.isEmpty(clusters)) {
      return null;
    }
    return clusters[0];
  }

  getCurrentUser(): User | null {
    const contextName = this.getCurrentContext();
    return this.getUser(contextName);
  }

  getUser(contextName: string): User | null {
    const kubeconfig = this.getKubeconfig();
    if (!kubeconfig) {
      return null;
    }

    const context = this.getContext(contextName);
    if (!context) {
      return null;
    }

    const users = kubeconfig.users.filter(user => {
      return user.name === context.context.user;
    });
    if (_.isEmpty(users)) {
      return null;
    }
    return users[0];
  }

  getCurrentServer(): string {
    const contextName = this.getCurrentContext();
    return this.getServer(contextName);
  }

  getServer(contextName: string): string {
    const context = this.getContext(contextName);
    if (!context) {
      return '';
    }

    const cluster = this.getCluster(context.context.cluster);
    if (!cluster) {
      return '';
    }

    return cluster.cluster.server;
  }

  getCurrentSidecarHost(): string {
    const contextName = this.getCurrentContext();
    return this.getSidecarHost(contextName);
  }

  getSidecarHost(contextName: string): string {
    const context = this.getContext(contextName);
    if (!context) {
      return '';
    }

    const cluster = this.getCluster(context.context.cluster);
    if (!cluster) {
      return '';
    }

    return cluster.cluster.sidecarHost;
  }

  getCurrentCertificateAuthorityData(): string {
    const contextName = this.getCurrentContext();
    return this.getCertificateAuthorityData(contextName);
  }

  getCertificateAuthorityData(contextName: string): string {
    const context = this.getContext(contextName);
    if (!context) {
      return '';
    }

    const cluster = this.getCluster(context.context.cluster);
    if (!cluster) {
      return '';
    }

    return cluster.cluster.certificateAuthorityData;
  }

  /**
   * Switch current context
   * @param context
   */
  switchContext(context: string) {
    const kubeconfig = this.getKubeconfig();
    const currentUser = this.getCurrentUser();
    if (
      kubeconfig.contexts.find(ctx => {
        return ctx.name === context;
      })
    ) {
      // Switch context in kubeconfig and server config in cookie
      kubeconfig.currentContext = context;
      this.setKubeconfig(dumpYaml(kubeconfig));

      // Switch JWE tokens in cookie
      const userNames = JSON.parse(this.cookies_.get(this.CONFIG.userNamesCookieName));
      const currentJWEToken = this.cookies_.get(this.CONFIG.authTokenCookieName);
      const newUserName = this.getUser(context).name;
      const newUserNames = [];
      for (let userName of userNames) {
        let jweToken = '';
        if (userName === DefaultUserName) {
          // Change current JWE token cookie name to be named
          userName = '-' + currentUser.name;
          newUserNames.push(currentUser.name);
          jweToken = currentJWEToken;
        } else if (userName === newUserName) {
          // Change nwe JWE token cookie name to be no-named
          userName = DefaultUserName;
          newUserNames.push(DefaultUserName);
          jweToken = this.cookies_.get(this.CONFIG.authTokenCookieName + '-' + newUserName);
          this.cookies_.delete(this.CONFIG.authTokenCookieName + '-' + newUserName);
        } else {
          // No change
          continue;
        }
        this.cookies_.set(this.CONFIG.authTokenCookieName + userName, jweToken, null, null, null, false, 'Strict');
      }
      this.cookies_.set(
        this.CONFIG.userNamesCookieName,
        JSON.stringify(newUserNames),
        null,
        null,
        null,
        false,
        'Strict',
      );

      this.ngZone_.run(() => {
        this.router_.navigate(['overview']);
      });
    } else {
      this.ngZone_.run(() => {
        this.router_.navigate(['login']);
      });
    }
  }
}
