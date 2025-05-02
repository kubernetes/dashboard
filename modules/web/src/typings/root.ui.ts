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

import {Type} from '@angular/core';
import {GlobalSettings, ObjectMeta, ResourceList, Theme, TypeMeta} from '@api/root.api';
import {KdError} from '@api/root.shared';
import {ListIdentifier} from '@common/components/resourcelist/groupids';

export interface BreadcrumbConfig {
  label?: string;
  parent?: string;
}

export class Breadcrumb {
  label: string;
  stateLink: string[];
}

export type ThemeSwitchCallback = (isLightThemeEnabled: boolean) => void;
export type ColumnWhenCallback = () => boolean;

export type onSettingsLoadCallback = (settings?: GlobalSettings) => void;
export type onSettingsFailCallback = (err?: KdError) => void;

export interface OnListChangeEvent {
  id: ListIdentifier;
  groupId: string;
  items: number;
  filtered: boolean;
  resourceList: ResourceList;
}

export interface ActionColumnDef<T extends ActionColumn> {
  name: string;
  component: Type<T>;
}

export interface ColumnWhenCondition {
  col: string;
  afterCol: string;
  whenCallback: ColumnWhenCallback;
}

export interface ActionColumn {
  setTypeMeta(typeMeta: TypeMeta): void;
  setObjectMeta(objectMeta: ObjectMeta): void;
  setDisplayName(displayName: string): void;
  setNamespaced(namespaced: boolean): void;
}

export interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

export interface KdFile {
  name: string;
  content: string;
}

export interface VersionInfo {
  dirty: boolean;
  raw: string;
  hash: string;
  distance: number;
  tag: string;
  semver: SemverInfo;
  suffix: string;
  semverString: string;
  packageVersion: string;
}

export interface SemverInfo {
  raw: string;
  major: number;
  minor: number;
  patch: number;
  prerelease: string[];
  build: string[];
  version: string;
  loose: boolean;
  options: SemverInfoOptions;
}

export interface SemverInfoOptions {
  loose: boolean;
  includePrerelease: boolean;
}

export interface RatioItem {
  name: string;
  value: number;
}

export interface ResourcesRatio {
  cronJobRatio: RatioItem[];
  daemonSetRatio: RatioItem[];
  deploymentRatio: RatioItem[];
  jobRatio: RatioItem[];
  podRatio: RatioItem[];
  replicaSetRatio: RatioItem[];
  replicationControllerRatio: RatioItem[];
  statefulSetRatio: RatioItem[];
}

export interface StateError {
  error: KdError;
}

export interface ViewportMetadata {
  target: HTMLElement;
  visible: boolean;
}

export interface AppConfig {
  themes: Theme[];
}

export interface IConfig {
  authTokenCookieName: string;
  csrfHeaderName: string;
  authTokenHeaderName: string;
  defaultNamespace: string;
  supportedLanguages: LanguageConfig[];
  defaultLanguage: string;
  languageCookieName: string;
}

export interface LanguageConfig {
  value: string;
  label: string;
}

export enum IMessageKey {
  Open = 'Open',
  Close = 'Close',
  Pin = 'Pin',
  Unpin = 'Unpin',
  Expand = 'Expand',
  Minimize = 'Minimize',
  Unknown = 'Unknown',
}

export type IMessage = {
  [key in IMessageKey]: string;
};

export enum IBreadcrumbMessageKey {
  Logs = 'Logs',
  Error = 'Error',
  Create = 'Create',
  Shell = 'Shell',
  Events = 'Events',
  Overview = 'Overview',
  Workloads = 'Workloads',
  CronJobs = 'CronJobs',
  DaemonSets = 'DaemonSets',
  Deployments = 'Deployments',
  Jobs = 'Jobs',
  Pods = 'Pods',
  ReplicaSets = 'ReplicaSets',
  ReplicationControllers = 'ReplicationControllers',
  StatefulSets = 'StatefulSets',
  Service = 'Service',
  Ingresses = 'Ingresses',
  IngressClasses = 'IngressClasses',
  Services = 'Services',
  ConfigAndStorage = 'ConfigAndStorage',
  ConfigMaps = 'ConfigMaps',
  PersistentVolumeClaims = 'PersistentVolumeClaims',
  Secrets = 'Secrets',
  StorageClasses = 'StorageClasses',
  Cluster = 'Cluster',
  ClusterRoleBindings = 'ClusterRoleBindings',
  ClusterRoles = 'ClusterRoles',
  Namespaces = 'Namespaces',
  NetworkPolicies = 'NetworkPolicies',
  Nodes = 'Nodes',
  PersistentVolumes = 'PersistentVolumes',
  RoleBindings = 'RoleBindings',
  Roles = 'Roles',
  ServiceAccounts = 'ServiceAccounts',
  CustomResourceDefinitions = 'CustomResourceDefinitions',
  Settings = 'Settings',
  About = 'About',
}

export type IBreadcrumbMessage = {
  [key in IBreadcrumbMessageKey]: string;
};
