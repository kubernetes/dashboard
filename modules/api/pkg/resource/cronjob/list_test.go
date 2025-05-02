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

package cronjob_test

import (
	"reflect"
	"testing"

	batch "k8s.io/api/batch/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/cronjob"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/types"
)

func TestGetCronJobListFromChannels(t *testing.T) {
	cases := []struct {
		raw           batch.CronJobList
		rawError      error
		expected      *cronjob.CronJobList
		expectedError error
	}{
		{
			batch.CronJobList{},
			nil,
			&cronjob.CronJobList{
				ListMeta: types.ListMeta{},
				Status:   common.ResourceStatus{},
				Items:    []cronjob.CronJob{},
				Errors:   []error{},
			},
			nil,
		},
		{
			batch.CronJobList{},
			customError,
			nil,
			customError,
		},
		{
			batch.CronJobList{
				Items: []batch.CronJob{
					{
						ObjectMeta: metaV1.ObjectMeta{
							Name:      name,
							Namespace: namespace,
							Labels:    labels,
						},
					},
					{
						ObjectMeta: metaV1.ObjectMeta{
							Name:      name,
							Namespace: namespace,
							Labels:    labels,
						},
					},
				},
			},
			nil,
			&cronjob.CronJobList{
				ListMeta: types.ListMeta{TotalItems: 2},
				Status:   common.ResourceStatus{Failed: 2},
				Items: []cronjob.CronJob{{
					ObjectMeta: types.ObjectMeta{
						Name:      name,
						Namespace: namespace,
						Labels:    labels,
					},
					TypeMeta:        types.TypeMeta{Kind: types.ResourceKindCronJob},
					ContainerImages: []string{},
				}, {
					ObjectMeta: types.ObjectMeta{
						Name:      name,
						Namespace: namespace,
						Labels:    labels,
					},
					TypeMeta:        types.TypeMeta{Kind: types.ResourceKindCronJob},
					ContainerImages: []string{},
				}},
				Errors: []error{},
			},
			nil,
		},
	}

	for _, c := range cases {
		channels := &common.ResourceChannels{
			CronJobList: common.CronJobListChannel{
				List:  make(chan *batch.CronJobList, 1),
				Error: make(chan error, 1),
			},
		}

		channels.CronJobList.Error <- c.rawError
		channels.CronJobList.List <- &c.raw

		actual, err := cronjob.GetCronJobListFromChannels(channels, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetCronJobListFromChannels() ==\n %#v\nExpected: %#v", actual, c.expected)
		}
		if !reflect.DeepEqual(err, c.expectedError) {
			t.Errorf("GetCronJobListFromChannels() ==\n %#v\nExpected: %#v", err, c.expectedError)
		}
	}
}
