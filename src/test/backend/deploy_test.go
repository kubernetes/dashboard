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

package main

import (
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"
	"reflect"
	"testing"
)

func TestDeployApp(t *testing.T) {
	namespace := "foo-namespace"
	spec := &AppDeploymentSpec{
		Namespace: namespace,
		Name:      "foo-name",
	}
	expectedRc := &api.ReplicationController{
		ObjectMeta: api.ObjectMeta{
			Name:        "foo-name",
			Labels:      map[string]string{},
			Annotations: map[string]string{},
		},
		Spec: api.ReplicationControllerSpec{
			Template: &api.PodTemplateSpec{
				ObjectMeta: api.ObjectMeta{
					Name:        "foo-name",
					Labels:      map[string]string{},
					Annotations: map[string]string{},
				},
				Spec: api.PodSpec{
					Containers: []api.Container{{
						Name: "foo-name",
					}},
				},
			},
			Selector: map[string]string{},
		},
	}

	testClient := testclient.NewSimpleFake()

	DeployApp(spec, testClient)

	createAction := testClient.Actions()[0].(testclient.CreateActionImpl)
	if len(testClient.Actions()) != 1 {
		t.Errorf("Expected one create action but got %#v", len(testClient.Actions()))
	}

	if createAction.Namespace != namespace {
		t.Errorf("Expected namespace to be %#v but go %#v", namespace, createAction.Namespace)
	}

	rc := createAction.GetObject().(*api.ReplicationController)
	if !reflect.DeepEqual(rc, expectedRc) {
		t.Errorf("Expected replication controller \n%#v\n to be created but got \n%#v\n",
			expectedRc, rc)
	}
}

func TestDeployAppContainerCommands(t *testing.T) {
	command := "foo-command"
	commandArgs := "foo-command-args"
	spec := &AppDeploymentSpec{
		Namespace:            "foo-namespace",
		Name:                 "foo-name",
		ContainerCommand:     &command,
		ContainerCommandArgs: &commandArgs,
	}
	testClient := testclient.NewSimpleFake()

	DeployApp(spec, testClient)

	createAction := testClient.Actions()[0].(testclient.CreateActionImpl)

	rc := createAction.GetObject().(*api.ReplicationController)
	container := rc.Spec.Template.Spec.Containers[0]
	if container.Command[0] != command {
		t.Errorf("Expected command to be %#v but got %#v",
			command, container.Command)
	}

	if container.Args[0] != commandArgs {
		t.Errorf("Expected command args to be %#v but got %#v",
			commandArgs, container.Args)
	}
}
