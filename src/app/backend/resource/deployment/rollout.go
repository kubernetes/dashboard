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
	"github.com/kubernetes/dashboard/src/app/backend/api"
	v1 "k8s.io/api/apps/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"

	"errors"
)

// RollbackDeployment rollback to a specific replicaSet version
func RollbackDeployment(client client.Interface, rollbackSpec *AppDeployRollBackSpec) error {
	deployment, err := client.AppsV1().Deployments(rollbackSpec.Namespace).Get(rollbackSpec.Name, metaV1.GetOptions{})
	if err != nil {
		return err
	}
	currRevision := deployment.Annotations["deployment.kubernetes.io/revision"]
	if currRevision == "1" {
		return errors.New("No revision for rolling back ")
	}
	matchRS, err := GetReplicateSetFromDeployment(client, rollbackSpec.Namespace, rollbackSpec.Name)
	if err != nil {
		return err
	}
	for _, rs := range matchRS {
		if rs.Annotations["deployment.kubernetes.io/revision"] == rollbackSpec.Number {
			updateDeployment := deployment.DeepCopy()
			updateDeployment.Spec.Template.Spec = rs.Spec.Template.Spec
			_, err = client.AppsV1().Deployments(rollbackSpec.Namespace).Update(updateDeployment)
			if err != nil {
				return err
			}
			return nil
		}
	}
	return errors.New("No match revisionNumber replicateSet for deployment ")
}

// RollPauseDeployment is used to pause a deployment
func RollPauseDeployment(client client.Interface, namespace, deploymentName string) (*v1.Deployment, error) {
	deployment, err := client.AppsV1().Deployments(namespace).Get(deploymentName, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}
	if deployment.Spec.Paused {
		deployment.Spec.Paused = false
		_, err = client.AppsV1().Deployments(namespace).Update(deployment)
		if err != nil {
			return nil, err
		}
		return deployment, nil
	}
	return nil, errors.New("the deployment is already paused")
}

// RollResumeDeployment is used to resume a deployment
func RollResumeDeployment(client client.Interface, namespace, deploymentName string) (*v1.Deployment, error) {
	deployment, err := client.AppsV1().Deployments(namespace).Get(deploymentName, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}
	if !deployment.Spec.Paused {
		deployment.Spec.Paused = true
		_, err = client.AppsV1().Deployments(namespace).Update(deployment)
		if err != nil {
			return nil, err
		}
		return deployment, nil
	}
	return nil, errors.New("the deployment is already resumed")
}

// GetReplicateSetFromDeployment return all replicateSet which is belong to the deployment
func GetReplicateSetFromDeployment(client client.Interface, namespace, deploymentName string) ([]v1.ReplicaSet, error) {
	deployment, err := client.AppsV1().Deployments(namespace).Get(deploymentName, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}
	allRS, err := client.AppsV1().ReplicaSets(namespace).List(api.ListEverything)
	if err != nil {
		return nil, err
	}
	var result []v1.ReplicaSet
	for _, rs := range allRS.Items {
		if metaV1.IsControlledBy(&rs, deployment) {
			result = append(result, rs)
		}
	}
	return result, nil
}
