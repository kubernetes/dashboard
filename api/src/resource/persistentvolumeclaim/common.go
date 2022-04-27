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

package persistentvolumeclaim

import (
	"context"
	"log"
	"strings"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	api "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
)

// The code below allows to perform complex data section on []api.PersistentVolumeClaim

type PersistentVolumeClaimCell api.PersistentVolumeClaim

// GetPodPersistentVolumeClaims gets persistentvolumeclaims that are associated with this pod.
func GetPodPersistentVolumeClaims(client client.Interface, namespace string, podName string,
	dsQuery *dataselect.DataSelectQuery) (*PersistentVolumeClaimList, error) {

	pod, err := client.CoreV1().Pods(namespace).Get(context.TODO(), podName, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	claimNames := make([]string, 0)
	if pod.Spec.Volumes != nil && len(pod.Spec.Volumes) > 0 {
		for _, v := range pod.Spec.Volumes {
			persistentVolumeClaim := v.PersistentVolumeClaim
			if persistentVolumeClaim != nil {
				claimNames = append(claimNames, persistentVolumeClaim.ClaimName)
			}
		}
	}

	if len(claimNames) > 0 {
		channels := &common.ResourceChannels{
			PersistentVolumeClaimList: common.GetPersistentVolumeClaimListChannel(
				client, common.NewSameNamespaceQuery(namespace), 1),
		}

		persistentVolumeClaimList := <-channels.PersistentVolumeClaimList.List

		err = <-channels.PersistentVolumeClaimList.Error
		nonCriticalErrors, criticalError := errors.HandleError(err)
		if criticalError != nil {
			return nil, criticalError
		}

		podPersistentVolumeClaims := make([]api.PersistentVolumeClaim, 0)
		for _, pvc := range persistentVolumeClaimList.Items {
			for _, claimName := range claimNames {
				if strings.Compare(claimName, pvc.Name) == 0 {
					podPersistentVolumeClaims = append(podPersistentVolumeClaims, pvc)
					break
				}
			}
		}

		log.Printf("Found %d persistentvolumeclaims related to %s pod",
			len(podPersistentVolumeClaims), podName)

		return toPersistentVolumeClaimList(podPersistentVolumeClaims,
			nonCriticalErrors, dsQuery), nil
	}

	log.Printf("No persistentvolumeclaims found related to %s pod", podName)

	// No ClaimNames found in Pod details, return empty response.
	return &PersistentVolumeClaimList{}, nil
}

func (self PersistentVolumeClaimCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func toCells(std []api.PersistentVolumeClaim) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = PersistentVolumeClaimCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []api.PersistentVolumeClaim {
	std := make([]api.PersistentVolumeClaim, len(cells))
	for i := range std {
		std[i] = api.PersistentVolumeClaim(cells[i].(PersistentVolumeClaimCell))
	}
	return std
}
