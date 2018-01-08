// Copyright 2017 The Kubernetes Dashboard Authors.
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

package userlinks

import (
	"reflect"
	"testing"

	"strconv"

	"sort"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
)

func TestGetUserLinksForPersistentVolume(t *testing.T) {
	cases := []struct {
		persistentVolume          *v1.PersistentVolume
		namespace, name, resource string
		expected                  []UserLink
	}{
		{
			persistentVolume: &v1.PersistentVolume{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "pv-1", Namespace: "ns-1",
					Annotations: map[string]string{
						"alpha.dashboard.kubernetes.io/links": "{" +
							strconv.Quote("absolute_path") + ":" +
							strconv.Quote("http://monitoring.com/debug/requests") + "," +
							strconv.Quote("invalid") + ":" +
							strconv.Quote("://www.logs.com/click/here") + "}"},
				}},
			namespace: "ns-1", name: "pv-1", resource: api.ResourceKindPersistentVolume,
			expected: []UserLink{
				UserLink{Description: "absolute_path", Link: "http://monitoring.com/debug/requests", IsURLValid: true},
				UserLink{Description: "invalid", Link: "Invalid User Link: ://www.logs.com/click/here", IsURLValid: false}},
		},
	}

	for _, c := range cases {

		fakeClient := fake.NewSimpleClientset(c.persistentVolume)
		actual, _ := GetUserLinks(fakeClient, c.namespace, c.name, c.resource)

		// since order of the "actual" slice cannot be predicted we sort both slice so that the correct indices are compared
		sort.Slice(actual, func(i, j int) bool {
			return actual[i].Description < actual[j].Description
		})
		sort.Slice(c.expected, func(i, j int) bool {
			return c.expected[i].Description < c.expected[j].Description
		})

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetUserLinksForPersistentVolume(client,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
