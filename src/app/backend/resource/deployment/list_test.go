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
	"errors"
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	apps "k8s.io/api/apps/v1beta2"
	v1 "k8s.io/api/core/v1"
	k8serrors "k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func getReplicasPointer(replicas int32) *int32 {
	return &replicas
}

func TestGetDeploymentListFromChannels(t *testing.T) {
	cases := []struct {
		k8sDeployment      apps.DeploymentList
		k8sDeploymentError error
		pods               *v1.PodList
		expected           *DeploymentList
		expectedError      error
	}{
		{
			apps.DeploymentList{},
			nil,
			&v1.PodList{},
			&DeploymentList{
				ListMeta:          api.ListMeta{},
				Deployments:       []Deployment{},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				Errors:            []error{},
			},
			nil,
		},
		{
			apps.DeploymentList{},
			errors.New("MyCustomError"),
			&v1.PodList{},
			nil,
			errors.New("MyCustomError"),
		},
		{
			apps.DeploymentList{},
			&k8serrors.StatusError{},
			&v1.PodList{},
			nil,
			&k8serrors.StatusError{},
		},
		{
			apps.DeploymentList{},
			&k8serrors.StatusError{ErrStatus: metaV1.Status{}},
			&v1.PodList{},
			nil,
			&k8serrors.StatusError{ErrStatus: metaV1.Status{}},
		},
		{
			apps.DeploymentList{},
			&k8serrors.StatusError{ErrStatus: metaV1.Status{Reason: "foo-bar"}},
			&v1.PodList{},
			nil,
			&k8serrors.StatusError{ErrStatus: metaV1.Status{Reason: "foo-bar"}},
		},
		{
			apps.DeploymentList{
				Items: []apps.Deployment{{
					ObjectMeta: metaV1.ObjectMeta{
						Name:              "rs-name",
						Namespace:         "rs-namespace",
						Labels:            map[string]string{"key": "value"},
						CreationTimestamp: metaV1.Unix(111, 222),
					},
					Spec: apps.DeploymentSpec{
						Selector: &metaV1.LabelSelector{MatchLabels: map[string]string{"foo": "bar"}},
						Replicas: getReplicasPointer(21),
					},
					Status: apps.DeploymentStatus{
						Replicas: 7,
					},
				}},
			},
			nil,
			&v1.PodList{},
			&DeploymentList{
				ListMeta:          api.ListMeta{TotalItems: 1},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				Deployments: []Deployment{{
					ObjectMeta: api.ObjectMeta{
						Name:              "rs-name",
						Namespace:         "rs-namespace",
						Labels:            map[string]string{"key": "value"},
						CreationTimestamp: metaV1.Unix(111, 222),
					},
					TypeMeta: api.TypeMeta{Kind: api.ResourceKindDeployment},
					Pods: common.PodInfo{
						Current:  7,
						Desired:  getReplicasPointer(21),
						Failed:   0,
						Warnings: []common.Event{},
					},
				}},
				Errors: []error{},
			},
			nil,
		},
	}

	for _, c := range cases {
		channels := &common.ResourceChannels{
			DeploymentList: common.DeploymentListChannel{
				List:  make(chan *apps.DeploymentList, 1),
				Error: make(chan error, 1),
			},
			NodeList: common.NodeListChannel{
				List:  make(chan *v1.NodeList, 1),
				Error: make(chan error, 1),
			},
			ServiceList: common.ServiceListChannel{
				List:  make(chan *v1.ServiceList, 1),
				Error: make(chan error, 1),
			},
			PodList: common.PodListChannel{
				List:  make(chan *v1.PodList, 1),
				Error: make(chan error, 1),
			},
			EventList: common.EventListChannel{
				List:  make(chan *v1.EventList, 1),
				Error: make(chan error, 1),
			},
			ReplicaSetList: common.ReplicaSetListChannel{
				List:  make(chan *apps.ReplicaSetList, 1),
				Error: make(chan error, 1),
			},
		}

		channels.DeploymentList.Error <- c.k8sDeploymentError
		channels.DeploymentList.List <- &c.k8sDeployment

		channels.NodeList.List <- &v1.NodeList{}
		channels.NodeList.Error <- nil

		channels.ServiceList.List <- &v1.ServiceList{}
		channels.ServiceList.Error <- nil

		channels.PodList.List <- c.pods
		channels.PodList.Error <- nil

		channels.EventList.List <- &v1.EventList{}
		channels.EventList.Error <- nil

		channels.ReplicaSetList.List <- &apps.ReplicaSetList{}
		channels.ReplicaSetList.Error <- nil

		actual, err := GetDeploymentListFromChannels(channels, dataselect.NoDataSelect, nil)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetDeploymentListFromChannels() ==\n          %#v\nExpected: %#v", actual, c.expected)
		}
		if !reflect.DeepEqual(err, c.expectedError) {
			t.Errorf("GetDeploymentListFromChannels() ==\n          %#v\nExpected: %#v", err, c.expectedError)
		}
	}
}
