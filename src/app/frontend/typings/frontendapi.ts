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
import {GlobalSettings, K8sError, ObjectMeta, TypeMeta} from '@api/backendapi';

export interface BreadcrumbConfig {
  label?: string;
  parent?: string;
}

export class Breadcrumb {
  label: string;
  stateLink: string;
}

export type ThemeSwitchCallback = (isLightThemeEnabled: boolean) => void;
export type ColumnWhenCallback = () => boolean;

export type onSettingsLoadCallback = (settings?: GlobalSettings) => void;
export type onSettingsFailCallback = (err?: KdError|K8sError) => void;

export interface KnownErrors { unauthorized: KdError; }

export interface KdError {
  status: string;
  code: number;
  message: string;
}

export interface OnListChangeEvent {
  id: string;
  groupId: string;
  items: number;
  filtered: boolean;
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
}
