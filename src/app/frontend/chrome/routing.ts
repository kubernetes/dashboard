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

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../common/services/guard/auth';
import {ChromeComponent} from './component';

const routes: Routes = [
  {path: '', redirectTo: '/overview', pathMatch: 'full'},
  {
    path: '',
    component: ChromeComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'error',
        loadChildren: () => import('error/module').then(m => m.ErrorModule),
      },

      // Cluster group
      {
        path: 'cluster',
        loadChildren: () => import('resource/cluster/module').then(m => m.ClusterModule),
      },
      {
        path: 'clusterrole',
        loadChildren: () => import('resource/cluster/clusterrole/module').then(m => m.ClusterRoleModule),
      },
      {
        path: 'namespace',
        loadChildren: () => import('resource/cluster/namespace/module').then(m => m.NamespaceModule),
      },
      {
        path: 'networkpolicy',
        loadChildren: () => import('resource/cluster/networkpolicy/module').then(m => m.NetworkPolicyModule),
      },
      {
        path: 'node',
        loadChildren: () => import('resource/cluster/node/module').then(m => m.NodeModule),
      },
      {
        path: 'persistentvolume',
        loadChildren: () => import('resource/cluster/persistentvolume/module').then(m => m.PersistentVolumeModule),
      },
      {
        path: 'serviceaccount',
        loadChildren: () => import('resource/cluster/serviceaccount/module').then(m => m.ServiceAccountModule),
      },
      {
        path: 'storageclass',
        loadChildren: () => import('resource/cluster/storageclass/module').then(m => m.StorageClassModule),
      },

      // Overview
      {
        path: 'overview',
        loadChildren: () => import('overview/module').then(m => m.OverviewModule),
      },

      // Workloads group
      {
        path: 'workloads',
        loadChildren: () => import('resource/workloads/module').then(m => m.WorkloadsModule),
      },
      {
        path: 'cronjob',
        loadChildren: () => import('resource/workloads/cronjob/module').then(m => m.CronJobModule),
      },
      {
        path: 'daemonset',
        loadChildren: () => import('resource/workloads/daemonset/module').then(m => m.DaemonSetModule),
      },
      {
        path: 'deployment',
        loadChildren: () => import('resource/workloads/deployment/module').then(m => m.DeploymentModule),
      },
      {
        path: 'job',
        loadChildren: () => import('resource/workloads/job/module').then(m => m.JobModule),
      },
      {
        path: 'pod',
        loadChildren: () => import('resource/workloads/pod/module').then(m => m.PodModule),
      },
      {
        path: 'replicaset',
        loadChildren: () => import('resource/workloads/replicaset/module').then(m => m.ReplicaSetModule),
      },
      {
        path: 'replicationcontroller',
        loadChildren: () =>
          import('resource/workloads/replicationcontroller/module').then(m => m.ReplicationControllerModule),
      },
      {
        path: 'statefulset',
        loadChildren: () => import('resource/workloads/statefulset/module').then(m => m.StatefulSetModule),
      },

      // Discovery and load balancing group
      {
        path: 'discovery',
        loadChildren: () => import('resource/discovery/module').then(m => m.DiscoveryModule),
      },
      {
        path: 'ingress',
        loadChildren: () => import('resource/discovery/ingress/module').then(m => m.IngressModule),
      },
      {
        path: 'service',
        loadChildren: () => import('resource/discovery/service/module').then(m => m.ServiceModule),
      },
      {
        path: 'plugin',
        loadChildren: () => import('plugin/module').then(m => m.PluginModule),
      },

      // Config group
      {
        path: 'config',
        loadChildren: () => import('resource/config/module').then(m => m.ConfigModule),
      },
      {
        path: 'configmap',
        loadChildren: () => import('resource/config/configmap/module').then(m => m.ConfigMapModule),
      },
      {
        path: 'persistentvolumeclaim',
        loadChildren: () =>
          import('resource/config/persistentvolumeclaim/module').then(m => m.PersistentVolumeClaimModule),
      },
      {
        path: 'secret',
        loadChildren: () => import('resource/config/secret/module').then(m => m.SecretModule),
      },

      // Custom resource definitions
      {
        path: 'customresourcedefinition',
        loadChildren: () => import('crd/module').then(m => m.CrdModule),
      },

      // Others
      {
        path: 'settings',
        loadChildren: () => import('settings/module').then(m => m.SettingsModule),
      },
      {
        path: 'about',
        loadChildren: () => import('about/module').then(m => m.AboutModule),
      },

      {
        path: 'create',
        loadChildren: () => import('create/module').then(m => m.CreateModule),
      },
      {
        path: 'log',
        loadChildren: () => import('logs/module').then(m => m.LogsModule),
      },
      {
        path: 'shell',
        loadChildren: () => import('shell/module').then(m => m.ShellModule),
      },
      {
        path: 'search',
        loadChildren: () => import('search/module').then(m => m.SearchModule),
        runGuardsAndResolvers: 'always',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChromeRoutingModule {}
