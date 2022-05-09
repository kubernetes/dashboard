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

const baseHref = 'api/v1';

export enum Resource {
  job = 'job',
  cronJob = 'cronjob',
  crd = 'crd',
  crdFull = 'customresourcedefinition',
  crdObject = 'object',
  daemonSet = 'daemonset',
  deployment = 'deployment',
  pod = 'pod',
  replicaSet = 'replicaset',
  oldReplicaSet = 'oldreplicaset',
  newReplicaSet = 'newreplicaset',
  horizontalPodAutoscaler = 'horizontalpodautoscaler',
  replicationController = 'replicationcontroller',
  statefulSet = 'statefulset',
  node = 'node',
  namespace = 'namespace',
  persistentVolume = 'persistentvolume',
  storageClass = 'storageclass',
  ingressClass = 'ingressclass',
  clusterRole = 'clusterrole',
  clusterRoleBinding = 'clusterrolebinding',
  role = 'role',
  roleBinding = 'rolebinding',
  configMap = 'configmap',
  persistentVolumeClaim = 'persistentvolumeclaim',
  secret = 'secret',
  imagePullSecret = 'imagepullsecret',
  ingress = 'ingress',
  service = 'service',
  serviceAccount = 'serviceaccount',
  networkPolicy = 'networkpolicy',
  event = 'event',
  container = 'container',
  plugin = 'plugin',
}

export enum Utility {
  shell = 'shell',
}

class ResourceEndpoint {
  constructor(private readonly resource_: Resource, private readonly namespaced_ = false) {}

  list(): string {
    return `${baseHref}/${this.resource_}${this.namespaced_ ? '/:namespace' : ''}`;
  }

  detail(): string {
    return `${baseHref}/${this.resource_}${this.namespaced_ ? '/:namespace' : ''}/:name`;
  }

  child(resourceName: string, relatedResource: Resource, resourceNamespace?: string): string {
    if (!resourceNamespace) {
      resourceNamespace = ':namespace';
    }

    return `${baseHref}/${this.resource_}${
      this.namespaced_ ? `/${resourceNamespace}` : ''
    }/${resourceName}/${relatedResource}`;
  }
}

class UtilityEndpoint {
  constructor(private readonly utility_: Utility) {}

  shell(namespace: string, resourceName: string): string {
    return `${baseHref}/${Resource.pod}/${namespace}/${resourceName}/${this.utility_}`;
  }
}

export class EndpointManager {
  static resource(resource: Resource, namespaced?: boolean): ResourceEndpoint {
    return new ResourceEndpoint(resource, namespaced);
  }

  static utility(utility: Utility): UtilityEndpoint {
    return new UtilityEndpoint(utility);
  }
}
