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

package api_test

import (
	"reflect"
	"testing"

	v1 "k8s.io/api/authorization/v1"

	"github.com/kubernetes/dashboard/src/app/backend/client/api"
)

func TestToSelfSubjectAccessReview(t *testing.T) {
	ns := "test-ns"
	name := "test-name"
	resourceName := "deployment"
	verb := "GET"
	expected := &v1.SelfSubjectAccessReview{
		Spec: v1.SelfSubjectAccessReviewSpec{
			ResourceAttributes: &v1.ResourceAttributes{
				Namespace: ns,
				Name:      name,
				Resource:  "deployments",
				Verb:      "get",
			},
		},
	}

	got := api.ToSelfSubjectAccessReview(ns, name, resourceName, verb)
	if !reflect.DeepEqual(got, expected) {
		t.Fatalf("Expected to get %+v but got %+v", expected, got)
	}
}
