// Copyright 2015 Google Inc. All Rights Reserved.
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

/**
 * @fileoverview Externs for backend API and model objects. This should be kept in sync with the
 * backend code.
 *
 * Guidelines:
 *  - Model JSONs should have the same name as backend structs.
 *
 * @externs
 */

const backendApi = {};

/**
 * @typedef {{
 *   port: (number|null),
 *   protocol: string,
 *   targetPort: (number|null)
 * }}
 */
backendApi.PortMapping;

/**
 * @typedef {{
 *   containerImage: string,
 *   isExternal: boolean,
 *   name: string,
 *   description: string,
 *   portMappings: !Array<!backendApi.PortMapping>,
 *   replicas: number,
 *   namespace: string
 * }}
 */
backendApi.AppDeploymentSpec;

/**
 * @typedef {{
 *   replicaSets: !Array<!backendApi.ReplicaSet>
 * }}
 */
backendApi.ReplicaSetList;

/**
 * @typedef {{
 *   name: string,
 *   namespace: string,
 *   description: string,
 *   labels: !Object<string, string>,
 *   podsRunning: number,
 *   podsPending: number,
 *   containerImages: !Array<string>,
 *   creationTime: string,
 *   internalEndpoints: !Array<string>,
 *   externalEndpoints: !Array<string>
 * }}
 */
backendApi.ReplicaSet;

/**
 * @typedef {{
 *   name: string,
 *   namespace: string,
 *   labels: !Object<string, string>,
 *   labelSelector: !Object<string, string>,
 *   containerImages: !Array<string>,
 *   podsDesired: number,
 *   podsRunning: number,
 *   pods: !Array<!backendApi.ReplicaSetPod>
 * }}
 */
backendApi.ReplicaSetDetail;

/**
 * @typedef {{
 *   name: string,
 *   startTime: ?string,
 *   podIP: string,
 *   nodeName: string
 * }}
 */
backendApi.ReplicaSetPod;

/**
 * @typedef {{
 *   name: string
 * }}
 */
backendApi.NamespaceSpec;

/**
 * @typedef {{
 *   namespaces: !Array<string>
 * }}
 */
backendApi.NamespaceList;
