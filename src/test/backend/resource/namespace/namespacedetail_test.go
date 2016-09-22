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

package namespace

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
)

func TestGetNamespaceDetail(t *testing.T) {
	cases := []struct {
		namespace api.Namespace
		expected  *NamespaceDetail
	}{
		{
			api.Namespace{
				ObjectMeta: api.ObjectMeta{Name: "foo"},
				Status: api.NamespaceStatus{
					Phase: api.NamespaceActive,
				},
			},
			&NamespaceDetail{
				TypeMeta:   common.TypeMeta{Kind: "namespace"},
				ObjectMeta: common.ObjectMeta{Name: "foo"},
				Phase:      api.NamespaceActive,
			},
		},
	}
	for _, c := range cases {
		actual := toNamespaceDetail(c.namespace, common.EventList{}, nil, nil)
		if !reflect.DeepEqual(&actual, c.expected) {
			t.Errorf("toNamespaceDetail(%#v) == \n%#v\nexpected \n%#v\n",
				c.namespace, actual, c.expected)
		}
	}
}
