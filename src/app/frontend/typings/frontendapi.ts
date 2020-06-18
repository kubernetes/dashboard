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
import {GlobalSettings, K8sError, ObjectMeta, ResourceList, TypeMeta} from '@api/backendapi';
import {ListIdentifier} from '../common/components/resourcelist/groupids';

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

export interface KdError {
  status: string;
  code: number;
  message: string;

  localize(): KdError;
}

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

export interface PluginMetadata {
  name: string;
  path: string;
  dependencies: string[];
}

export interface PluginsConfig {
  status: number;
  plugins: PluginMetadata[];
  errors?: object[];
}

export interface ViewportMetadata {
  target: HTMLElement;
  visible: boolean;
}
