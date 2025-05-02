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

import {InjectionToken} from '@angular/core';
import {IBreadcrumbMessage, IBreadcrumbMessageKey, IMessage, IMessageKey} from '@api/root.ui';

export const MESSAGES_DI_TOKEN = new InjectionToken<IMessage>('kd.messages');

export const MESSAGES: IMessage = {
  [IMessageKey.Open]: $localize`Open notifications panel`,
  [IMessageKey.Close]: $localize`Close notifications panel`,
  [IMessageKey.Pin]: $localize`Pin resource`,
  [IMessageKey.Unpin]: $localize`Unpin resource`,
  [IMessageKey.Expand]: $localize`Expand card`,
  [IMessageKey.Minimize]: $localize`Minimize card`,
  [IMessageKey.Unknown]: $localize`Unknown`,
};

export const BREADCRUMBS: IBreadcrumbMessage = {
  [IBreadcrumbMessageKey.Logs]: $localize`Logs`,
  [IBreadcrumbMessageKey.Error]: $localize`Error`,
  [IBreadcrumbMessageKey.Create]: $localize`Create`,
  [IBreadcrumbMessageKey.Shell]: $localize`Shell`,
  [IBreadcrumbMessageKey.Events]: $localize`Events`,
  [IBreadcrumbMessageKey.Overview]: $localize`Overview`,
  [IBreadcrumbMessageKey.Workloads]: $localize`Workloads`,
  [IBreadcrumbMessageKey.CronJobs]: $localize`Cron Jobs`,
  [IBreadcrumbMessageKey.DaemonSets]: $localize`Daemon Sets`,
  [IBreadcrumbMessageKey.Deployments]: $localize`Deployments`,
  [IBreadcrumbMessageKey.Jobs]: $localize`Jobs`,
  [IBreadcrumbMessageKey.Pods]: $localize`Pods`,
  [IBreadcrumbMessageKey.ReplicaSets]: $localize`Replica Sets`,
  [IBreadcrumbMessageKey.ReplicationControllers]: $localize`Replication Controllers`,
  [IBreadcrumbMessageKey.StatefulSets]: $localize`Stateful Sets`,
  [IBreadcrumbMessageKey.Service]: $localize`Service`,
  [IBreadcrumbMessageKey.Ingresses]: $localize`Ingresses`,
  [IBreadcrumbMessageKey.IngressClasses]: $localize`Ingress Classes`,
  [IBreadcrumbMessageKey.Services]: $localize`Services`,
  [IBreadcrumbMessageKey.ConfigAndStorage]: $localize`Config And Storage`,
  [IBreadcrumbMessageKey.ConfigMaps]: $localize`Config Maps`,
  [IBreadcrumbMessageKey.PersistentVolumeClaims]: $localize`Persistent Volume Claims`,
  [IBreadcrumbMessageKey.Secrets]: $localize`Secrets`,
  [IBreadcrumbMessageKey.StorageClasses]: $localize`Storage Classes`,
  [IBreadcrumbMessageKey.Cluster]: $localize`Cluster`,
  [IBreadcrumbMessageKey.ClusterRoleBindings]: $localize`Cluster Role Bindings`,
  [IBreadcrumbMessageKey.ClusterRoles]: $localize`Cluster Roles`,
  [IBreadcrumbMessageKey.Namespaces]: $localize`Namespaces`,
  [IBreadcrumbMessageKey.NetworkPolicies]: $localize`Network Policies`,
  [IBreadcrumbMessageKey.Nodes]: $localize`Nodes`,
  [IBreadcrumbMessageKey.PersistentVolumes]: $localize`Persistent Volumes`,
  [IBreadcrumbMessageKey.RoleBindings]: $localize`Role Bindings`,
  [IBreadcrumbMessageKey.Roles]: $localize`Roles`,
  [IBreadcrumbMessageKey.ServiceAccounts]: $localize`Service Accounts`,
  [IBreadcrumbMessageKey.CustomResourceDefinitions]: $localize`Custom Resource Definitions`,
  [IBreadcrumbMessageKey.Settings]: $localize`Settings`,
  [IBreadcrumbMessageKey.About]: $localize`About`,
};
