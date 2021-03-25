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
	"context"
	"errors"
	"time"

	v1 "k8s.io/api/apps/v1"
	core "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
)

const (
	// FirstRevision is a first revision number
	FirstRevision = "1"
	// RestartedAtAnnotationKey is an annotation key for rollout restart
	RestartedAtAnnotationKey = "kubectl.kubernetes.io/restartedAt"
	// RevisionAnnotationKey is an annotation key for rollout targeted or resulted revision
	RevisionAnnotationKey = "deployment.kubernetes.io/revision"
)

// RolloutSpec is a specification for deployment rollout
type RolloutSpec struct {
	// Revision is the requested/resulted revision number of the ReplicateSet to rollback.
	Revision string `json:"revision"`
}

// HistoryList contains a list of Replica Sets in the deployment.
type HistoryList struct {
	ListMeta api.ListMeta `json:"listMeta"`

	// Basic information about resources status on the list.
	Status common.ResourceStatus `json:"status"`

	// Unordered list of Replica Sets.
	HistoryList []History `json:"history"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// History is a presentation layer view of Kubernetes Replica Set resource for history.
type History struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// Container images of the Replica Set.
	ContainerImages []string `json:"containerImages"`

	// Restarted At
	RestartedAt metaV1.Time `json:"restartedAt"`

	// Parent Object Metadata
	ParentObjectMeta api.ObjectMeta `json:"parentObjectMeta"`
}

// RollbackDeployment rollback to a specific ReplicaSet revision
func RollbackDeployment(client client.Interface, rolloutSpec *RolloutSpec, namespace, name string) (*RolloutSpec, error) {
	deployment, err := client.AppsV1().Deployments(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}
	matchRS, currRevision, err := GetReplicaSetFromDeployment(client, namespace, name)
	if currRevision == FirstRevision {
		return nil, errors.New("No revision for rolling back ")
	}
	if err != nil {
		return nil, err
	}
	for _, rs := range matchRS {
		if rs.Annotations[RevisionAnnotationKey] == rolloutSpec.Revision {
			updateDeployment := deployment.DeepCopy()
			updateDeployment.Spec.Template.Spec = rs.Spec.Template.Spec
			res, err := client.AppsV1().Deployments(namespace).Update(context.TODO(), updateDeployment, metaV1.UpdateOptions{})
			if err != nil {
				return nil, err
			}
			return &RolloutSpec{
				Revision: res.Annotations[RevisionAnnotationKey],
			}, nil
		}
	}
	return nil, errors.New("There is no ReplicaSet that has the requested revision for the Deployment.")
}

// PauseDeployment is used to pause a deployment
func PauseDeployment(client client.Interface, namespace, name string) (*v1.Deployment, error) {
	deployment, err := client.AppsV1().Deployments(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}
	if !deployment.Spec.Paused {
		deployment.Spec.Paused = true
		_, err = client.AppsV1().Deployments(namespace).Update(context.TODO(), deployment, metaV1.UpdateOptions{})
		if err != nil {
			return nil, err
		}
		return deployment, nil
	}
	return nil, errors.New("The Deployment is already paused.")
}

// ResumeDeployment is used to resume a deployment
func ResumeDeployment(client client.Interface, namespace, name string) (*v1.Deployment, error) {
	deployment, err := client.AppsV1().Deployments(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}
	if deployment.Spec.Paused {
		deployment.Spec.Paused = false
		_, err = client.AppsV1().Deployments(namespace).Update(context.TODO(), deployment, metaV1.UpdateOptions{})
		if err != nil {
			return nil, err
		}
		return deployment, nil
	}
	return nil, errors.New("The deployment is already resumed.")
}

// RestartDeployment restarts a deployment in the manner of `kubectl rollout restart`.
func RestartDeployment(client client.Interface, namespace, name string) (*RolloutSpec, error) {
	deployment, err := client.AppsV1().Deployments(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	if deployment.Spec.Template.ObjectMeta.Annotations == nil {
		deployment.Spec.Template.ObjectMeta.Annotations = map[string]string{}
	}
	deployment.Spec.Template.ObjectMeta.Annotations[RestartedAtAnnotationKey] = time.Now().Format(time.RFC3339)
	res, err := client.AppsV1().Deployments(namespace).Update(context.TODO(), deployment, metaV1.UpdateOptions{})
	if err != nil {
		return nil, err
	}
	return &RolloutSpec{
		Revision: res.Annotations[RevisionAnnotationKey],
	}, nil
}

// GetReplicaSetFromDeployment return all replicaSet which is belong to the deployment
func GetReplicaSetFromDeployment(client client.Interface, namespace, name string) ([]v1.ReplicaSet, string, error) {
	deployment, err := client.AppsV1().Deployments(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, "", err
	}
	currentRevision := deployment.Annotations[RevisionAnnotationKey]
	selector, err := metaV1.LabelSelectorAsSelector(deployment.Spec.Selector)
	if err != nil {
		return nil, "", err
	}
	options := metaV1.ListOptions{LabelSelector: selector.String()}
	allRS, err := client.AppsV1().ReplicaSets(namespace).List(context.TODO(), options)
	if err != nil {
		return nil, "", err
	}
	var result []v1.ReplicaSet
	for _, rs := range allRS.Items {
		if metaV1.IsControlledBy(&rs, deployment) {
			result = append(result, rs)
		}
	}
	return result, currentRevision, nil
}

// GetDeploymentHistory return all replicaSet which is belong to the deployment for REST API
func GetDeploymentHistory(client client.Interface, namespace, name string) (*HistoryList, error) {
	rsList, currentRevision, err := GetReplicaSetFromDeployment(client, namespace, name)
	if err != nil {
		return nil, err
	}
	return ToHistoryList(namespace, name, rsList, currentRevision), nil
}

// ToHistoryList convert ReplicaSet array to HistoryList type.
func ToHistoryList(namespace, parentName string, replicaSets []v1.ReplicaSet, currentRevision string) *HistoryList {
	historyList := []History{}
	replicasetList := replicaset.ToReplicaSetList(replicaSets, []core.Pod{}, []core.Event{}, nil, dataselect.NoDataSelect, nil)
	for _, replicaSet := range replicaSets {
		historyList = append(historyList, ToHistory(namespace, parentName, replicaSet, currentRevision))
	}
	return &HistoryList{
		ListMeta:    replicasetList.ListMeta,
		Status:      replicasetList.Status,
		HistoryList: historyList,
		Errors:      replicasetList.Errors,
	}
}

// ToHistory convert ReplicaSet to History type.
func ToHistory(namespace, parentName string, replicaSet v1.ReplicaSet, currentRevision string) History {
	restartedAt := metaV1.Time{}
	if replicaSet.Spec.Template.ObjectMeta.Annotations != nil {
		timestamp, _ := time.Parse(time.RFC3339, replicaSet.Spec.Template.ObjectMeta.Annotations[RestartedAtAnnotationKey])
		restartedAt = metaV1.NewTime(timestamp)
	}
	history := History{
		ObjectMeta:      api.NewObjectMeta(replicaSet.ObjectMeta),
		TypeMeta:        api.NewTypeMeta(api.ResourceKindHistory),
		ContainerImages: common.GetContainerImages(&replicaSet.Spec.Template.Spec),
		RestartedAt:     restartedAt,
		ParentObjectMeta: api.ObjectMeta{
			Namespace: namespace,
			Name:      parentName,
		},
	}
	history.TypeMeta.CurrentRevision = (currentRevision == replicaSet.ObjectMeta.Annotations[RevisionAnnotationKey])
	return history
}
