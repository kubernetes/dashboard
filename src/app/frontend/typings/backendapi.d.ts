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

export interface ErrStatus {
  message: string;
  code: number;
  status: string;
  reason: string;
}

export interface Error { ErrStatus: ErrStatus; }

export interface CsrfToken { token: string; }

export interface LoginSpec {
  username: string;
  password: string;
  token: string;
  kubeconfig: string;
}

export interface LoginStatus {
  tokenPresent: boolean;
  headerPresent: boolean;
  httpsMode: boolean;
}

export interface AuthResponse {
  jweToken: string;
  errors: Error[];
}

export interface GlobalSettings {
  itemsPerPage: number;
  clusterName: string;
  autoRefreshTimeInterval: number;
}

export interface LocalSettings { isThemeDark: boolean; }

export interface AppConfig { serverTime: number; }

export interface CanIResponse { allowed: boolean; }
