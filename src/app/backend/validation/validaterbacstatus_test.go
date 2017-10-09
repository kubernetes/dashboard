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

package validation

import (
	"errors"
	"reflect"
	"testing"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/discovery"
	fakediscovery "k8s.io/client-go/discovery/fake"
	"k8s.io/client-go/kubernetes/fake"
	test "k8s.io/client-go/testing"
)

func areErrorsEqual(err1, err2 error) bool {
	return (err1 != nil && err2 != nil && err1.Error() == err2.Error()) ||
		(err1 == nil && err2 == nil)
}

type fakeServerGroupsMethod func() (*metav1.APIGroupList, error)

type FakeClient struct {
	fake.Clientset
	fakeServerGroupsMethod
}

func (self *FakeClient) Discovery() discovery.DiscoveryInterface {
	return &FakeDiscovery{
		FakeDiscovery:          fakediscovery.FakeDiscovery{Fake: &self.Fake},
		fakeServerGroupsMethod: self.fakeServerGroupsMethod,
	}
}

type FakeDiscovery struct {
	fakediscovery.FakeDiscovery
	fakeServerGroupsMethod
}

func (self *FakeDiscovery) ServerGroups() (*metav1.APIGroupList, error) {
	return self.fakeServerGroupsMethod()
}

func TestValidateRbacStatus(t *testing.T) {
	cases := []struct {
		info        string
		mockMethod  fakeServerGroupsMethod
		expected    *RbacStatus
		expectedErr error
	}{
		{
			"should throw an error when can't get api versions from server",
			func() (*metav1.APIGroupList, error) {
				return nil, errors.New("test-error")
			},
			nil,
			errors.New("Couldn't get available api versions from server: test-error"),
		},
		{
			"should disable rbacs when supported api version not enabled on the server",
			func() (*metav1.APIGroupList, error) {
				return &metav1.APIGroupList{Groups: []metav1.APIGroup{
					{Name: "rbac", Versions: []metav1.GroupVersionForDiscovery{
						{
							GroupVersion: "authorization.k8s.io/v1alpha1",
							Version:      "v1alpha1",
						},
					}},
				}}, nil
			},
			&RbacStatus{false},
			nil,
		},
		{
			"should enable rbacs when supported api version is enabled on the server",
			func() (*metav1.APIGroupList, error) {
				return &metav1.APIGroupList{Groups: []metav1.APIGroup{
					{Name: "rbac", Versions: []metav1.GroupVersionForDiscovery{
						{
							GroupVersion: "authorization.k8s.io/v1beta1",
							Version:      "v1beta1",
						},
					}},
				}}, nil
			},
			&RbacStatus{true},
			nil,
		},
	}

	for _, c := range cases {
		fakePtr := &test.Fake{}
		client := &FakeClient{
			Clientset:              fake.Clientset{Fake: *fakePtr},
			fakeServerGroupsMethod: c.mockMethod,
		}

		status, err := ValidateRbacStatus(client)
		if !areErrorsEqual(err, c.expectedErr) {
			t.Fatalf("Test case: %s. Expected error to be: %v, but got %v.", c.info,
				c.expectedErr, err)
		}

		if !reflect.DeepEqual(status, c.expected) {
			t.Fatalf("Test case: %s. Expected status to be: %v, but got %v.", c.info,
				c.expected, status)
		}
	}

}
