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

import ScaleResourceDialogController from './controller';

/**
 * Opens update replicas dialog.
 * @param {!md.$dialog} mdDialog
 * @param {string} namespace
 * @param {string} resourceName
 * @param {number} currentPods
 * @param {number} desiredPods
 * @param {string} resourceKindName
 * @param {string} resourceKindDisplayName
 * @return {!angular.$q.Promise}
 */
export default function showUpdateReplicasDialog(
    mdDialog, namespace, resourceName, currentPods, desiredPods, resourceKindName,
    resourceKindDisplayName) {
  return mdDialog.show({
    controller: ScaleResourceDialogController,
    controllerAs: '$ctrl',
    clickOutsideToClose: true,
    templateUrl: 'common/scaling/scaleresource.html',
    locals: {
      'namespace': namespace,
      'resourceName': resourceName,
      'currentPods': currentPods,
      'desiredPods': desiredPods,
      'resourceKindName': resourceKindName,
      'resourceKindDisplayName': resourceKindDisplayName,
    },
  });
}
