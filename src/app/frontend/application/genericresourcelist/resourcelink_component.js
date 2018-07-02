// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {StateParams} from '../../common/resource/resourcedetail';
import {stateName as ConfigmapDetail} from '../../configmap/detail/state';
import {stateName as CronjobDetail} from '../../cronjob/detail/state';
import {stateName as DaemonsetDetail} from '../../daemonset/detail/state';
import {stateName as DeploymentDetail} from '../../deployment/detail/state';
import {stateName as HorizontalpodautoscalerDetail} from '../../horizontalpodautoscaler/detail/state';
import {stateName as IngressDetail} from '../../ingress/detail/state';
import {stateName as JobDetail} from '../../job/detail/state';
import {stateName as NamespaceDetail} from '../../namespace/detail/state';
import {stateName as NodeDetail} from '../../node/detail/state';
import {stateName as PersistentvolumeDetail} from '../../persistentvolume/detail/state';
import {stateName as PersistentvolumeclaimDetail} from '../../persistentvolumeclaim/detail/state';
import {stateName as PodDetail} from '../../pod/detail/state';
import {stateName as ReplicasetDetail} from '../../replicaset/detail/state';
import {stateName as ReplicationcontrollerDetail} from '../../replicationcontroller/detail/state';
import {stateName as SecretDetail} from '../../secret/detail/state';
import {stateName as ServiceDetail} from '../../service/detail/state';
import {stateName as StatefulSetDetail} from '../../statefulset/detail/state';
import {stateName as StorageclassDetail} from '../../storageclass/detail/state';


/**
 * resource link
 */
class ResourceLinkController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  $onInit() {
    this.href = this.getResourceHref();
  }

  getResourceHref() {
    switch (this.kind) {
      case 'service':
        this.detailState = ServiceDetail;
        break;
      case 'statefulset':
        this.detailState = StatefulSetDetail;
        break;
      case 'configmap':
        this.detailState = ConfigmapDetail;
        break;
      case 'daemonset':
        this.detailState = DaemonsetDetail;
        break;
      case 'deployment':
        this.detailState = DeploymentDetail;
        break;
      case 'horizontalpodautoscaler':
        this.detailState = HorizontalpodautoscalerDetail;
        break;
      case 'ingress':
        this.detailState = IngressDetail;
        break;
      case 'job':
        this.detailState = JobDetail;
        break;
      case 'cronjob':
        this.detailState = CronjobDetail;
        break;
      case 'namespace':
        this.detailState = NamespaceDetail;
        break;
      case 'node':
        this.detailState = NodeDetail;
        break;
      case 'persistentvolumeclaim':
        this.detailState = PersistentvolumeclaimDetail;
        break;
      case 'persistentvolume':
        this.detailState = PersistentvolumeDetail;
        break;
      case 'pod':
        this.detailState = PodDetail;
        break;
      case 'replicaset':
        this.detailState = ReplicasetDetail;
        break;
      case 'replicationcontroller':
        this.detailState = ReplicationcontrollerDetail;
        break;
      case 'secret':
        this.detailState = SecretDetail;
        break;
      case 'storageclass':
        this.detailState = StorageclassDetail;
        break;
      default:
        this.detailState = null;
    }
    return this.state_.href(this.detailState, new StateParams(this.namespace, this.name));
  }
}

/**
 * @return {!angular.Component}
 */
export const ResourceLinkComponent = {
  bindings: {
    name: '@',
    kind: '@',
    namespace: '@',
  },
  templateUrl: 'application/genericresourcelist/resourcelink.html',
  controller: ResourceLinkController,
};
