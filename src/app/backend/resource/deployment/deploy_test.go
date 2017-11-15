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
	"reflect"
	"regexp"
	"testing"

	apps "k8s.io/api/apps/v1beta2"
	api "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
	core "k8s.io/client-go/testing"
)

func TestDeployApp(t *testing.T) {
	replicas := int32(0)
	namespace := "foo-namespace"
	spec := &AppDeploymentSpec{
		Namespace:       namespace,
		Name:            "foo-name",
		RunAsPrivileged: true,
	}

	expected := &apps.Deployment{
		ObjectMeta: metaV1.ObjectMeta{
			Name:        "foo-name",
			Labels:      map[string]string{},
			Annotations: map[string]string{},
		},
		Spec: apps.DeploymentSpec{
			Selector: &metaV1.LabelSelector{
				MatchLabels: map[string]string{},
			},
			Replicas: &replicas,
			Template: api.PodTemplateSpec{
				ObjectMeta: metaV1.ObjectMeta{
					Name:        "foo-name",
					Labels:      map[string]string{},
					Annotations: map[string]string{},
				},
				Spec: api.PodSpec{
					Containers: []api.Container{{
						Name: "foo-name",
						SecurityContext: &api.SecurityContext{
							Privileged: &spec.RunAsPrivileged,
						},
						Resources: api.ResourceRequirements{
							Requests: make(map[api.ResourceName]resource.Quantity),
						},
					}},
				},
			},
		},
	}

	testClient := fake.NewSimpleClientset()

	DeployApp(spec, testClient)

	createAction := testClient.Actions()[0].(core.CreateActionImpl)
	if len(testClient.Actions()) != 1 {
		t.Errorf("Expected one create action but got %#v", len(testClient.Actions()))
	}

	if createAction.GetNamespace() != namespace {
		t.Errorf("Expected namespace to be %#v but go %#v", namespace, createAction.GetNamespace())
	}

	deployment := createAction.GetObject().(*apps.Deployment)
	if !reflect.DeepEqual(deployment, expected) {
		t.Errorf("Expected replication controller \n%#v\n to be created but got \n%#v\n",
			expected, deployment)
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
	testClient := fake.NewSimpleClientset()

	DeployApp(spec, testClient)
	createAction := testClient.Actions()[0].(core.CreateActionImpl)

	rc := createAction.GetObject().(*apps.Deployment)
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

func TestDeployShouldPopulateEnvVars(t *testing.T) {
	spec := &AppDeploymentSpec{
		Namespace: "foo-namespace",
		Name:      "foo-name",
		Variables: []EnvironmentVariable{{"foo", "bar"}},
	}
	testClient := fake.NewSimpleClientset()

	DeployApp(spec, testClient)

	createAction := testClient.Actions()[0].(core.CreateActionImpl)

	rc := createAction.GetObject().(*apps.Deployment)
	container := rc.Spec.Template.Spec.Containers[0]
	if !reflect.DeepEqual(container.Env, []api.EnvVar{{Name: "foo", Value: "bar"}}) {
		t.Errorf("Expected environment variables to be %#v but got %#v",
			[]api.EnvVar{{Name: "foo", Value: "bar"}}, container.Env)
	}
}

func TestDeployShouldGeneratePortNames(t *testing.T) {
	spec := PortMapping{Port: 80, TargetPort: 8080, Protocol: api.ProtocolTCP}

	name := generatePortMappingName(spec)

	pattern := "tcp-80-8080-\\w+"
	match, _ := regexp.MatchString(pattern, name)
	if !match {
		t.Errorf("Expected command to match %#v but got %#v",
			pattern, name)
	}
}

func TestDeployWithResourceRequirements(t *testing.T) {
	cpuRequirement := resource.Quantity{}
	memoryRequirement := resource.Quantity{}
	spec := &AppDeploymentSpec{
		Namespace:         "foo-namespace",
		Name:              "foo-name",
		CpuRequirement:    &cpuRequirement,
		MemoryRequirement: &memoryRequirement,
	}
	expectedResources := api.ResourceRequirements{
		Requests: map[api.ResourceName]resource.Quantity{
			api.ResourceMemory: memoryRequirement,
			api.ResourceCPU:    cpuRequirement,
		},
	}
	testClient := fake.NewSimpleClientset()

	DeployApp(spec, testClient)

	createAction := testClient.Actions()[0].(core.CreateActionImpl)

	rc := createAction.GetObject().(*apps.Deployment)
	container := rc.Spec.Template.Spec.Containers[0]
	if !reflect.DeepEqual(container.Resources, expectedResources) {
		t.Errorf("Expected resource requirements to be %#v but got %#v",
			expectedResources, container.Resources)
	}
}

func TestGetAvailableProtocols(t *testing.T) {
	expected := &Protocols{Protocols: []api.Protocol{"TCP", "UDP"}}

	actual := GetAvailableProtocols()
	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("Expected protocols to be %#v but got %#v",
			expected, actual)
	}
}
