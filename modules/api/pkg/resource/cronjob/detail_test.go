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
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"

	"k8s.io/dashboard/api/pkg/resource/cronjob"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/types"
)

func TestGetCronJobDetail(t *testing.T) {
	cases := []struct {
		namespace, name string
		expectedActions []string
		raw             *batch.CronJob
		expected        *cronjob.CronJobDetail
	}{
		{
			namespace,
			name,
			[]string{"get"},
			&batch.CronJob{
				ObjectMeta: metav1.ObjectMeta{
					Name:      name,
					Namespace: namespace,
					Labels:    labels,
				},
				Spec: batch.CronJobSpec{
					Suspend: &suspend,
				},
			},
			&cronjob.CronJobDetail{
				CronJob: cronjob.CronJob{
					ObjectMeta: types.ObjectMeta{
						Name:      name,
						Namespace: namespace,
						Labels:    labels,
					},
					TypeMeta:        types.TypeMeta{Kind: types.ResourceKindCronJob},
					Suspend:         &suspend,
					ContainerImages: []string{},
				},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.raw)
		dataselect.DefaultDataSelectWithMetrics.MetricQuery = dataselect.NoMetrics
		actual, _ := cronjob.GetCronJobDetail(fakeClient, c.namespace, c.name)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s",
					actions[i], verb)
			}
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetCronJobDetail() got:\n%#v,\nexpected:\n%#v", actual, c.expected)
		}
	}
}
