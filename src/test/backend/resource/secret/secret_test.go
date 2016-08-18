// Copyright 2015 Google Inc. All Rights Reserved.
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

package secret

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

var k8SecretList = &api.SecretList{
	Items: []api.Secret{
		{
			ObjectMeta: api.ObjectMeta{
				Name:              "user1",
				Namespace:         "foo",
				CreationTimestamp: unversioned.Unix(111, 222),
			},
		},
		{
			ObjectMeta: api.ObjectMeta{
				Name:              "user2",
				Namespace:         "foo",
				CreationTimestamp: unversioned.Unix(111, 222),
			},
		},
	},
}

func TestNewSecretListCreation(t *testing.T) {
	cases := []struct {
		k8sRs     *api.SecretList
		expected  *SecretList
		namespace *common.NamespaceQuery
	}{
		{
			k8SecretList,
			&SecretList{
				Secrets: []Secret{
					{
						ObjectMeta: common.ObjectMeta{
							Name:              "user1",
							Namespace:         "foo",
							CreationTimestamp: unversioned.Unix(111, 222),
						},
						TypeMeta: common.NewTypeMeta(common.ResourceKindSecret),
					},
					{
						ObjectMeta: common.ObjectMeta{
							Name:              "user2",
							Namespace:         "foo",
							CreationTimestamp: unversioned.Unix(111, 222),
						},
						TypeMeta: common.NewTypeMeta(common.ResourceKindSecret),
					},
				},
				ListMeta: common.ListMeta{2},
			},
			common.NewNamespaceQuery([]string{"foo"}),
		},
	}

	for _, c := range cases {
		actual := NewSecretList(c.k8sRs.Items, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("NewSecretList() ==\n          %#v\nExpected: %#v", actual, c.expected)
		}
	}
}
