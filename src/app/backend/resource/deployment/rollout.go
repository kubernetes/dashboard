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

package deployment

import (
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"

	"errors"
)

//RollbackDeployment rollback to a specific replicaSet version
func RollbackDeployment(client client.Interface, namespace string, deploymentName, replicaSetName string) error {
	deployment, err := client.AppsV1().Deployments(namespace).Get(deploymentName, metaV1.GetOptions{})
	if err != nil {
		return err
	}
	currRevision := deployment.Annotations["deployment.kubernetes.io/revision"]
	if currRevision == "1" {
		return errors.New("No revision for rolling back ")
	}
	replicaSet, err := client.AppsV1().ReplicaSets(namespace).Get(replicaSetName, metaV1.GetOptions{})
	if err != nil {
		return nil
	}
	updateDeployment := deployment.DeepCopy()
	updateDeployment.Spec.Template.Spec = replicaSet.Spec.Template.Spec
	_, err = client.AppsV1().Deployments(namespace).Update(updateDeployment)
	if err != nil {
		return nil
	}
	return nil
}
