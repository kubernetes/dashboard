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
	"fmt"
	"log"
	"strings"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/resource"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	cmdutil "k8s.io/kubernetes/pkg/kubectl/cmd/util"
	kubectlResource "k8s.io/kubernetes/pkg/kubectl/resource"
	"k8s.io/kubernetes/pkg/util/intstr"
)

const (
	DescriptionAnnotationKey = "description"
)

// Specification for an app deployment.
type AppDeploymentSpec struct {
	// Name of the application.
	Name string `json:"name"`

	// Docker image path for the application.
	ContainerImage string `json:"containerImage"`

	// The name of an image pull secret in case of a private docker repository.
	ImagePullSecret *string `json:"imagePullSecret"`

	// Command that is executed instead of container entrypoint, if specified.
	ContainerCommand *string `json:"containerCommand"`

	// Arguments for the specified container command or container entrypoint (if command is not
	// specified here).
	ContainerCommandArgs *string `json:"containerCommandArgs"`

	// Number of replicas of the image to maintain.
	Replicas int `json:"replicas"`

	// Port mappings for the service that is created. The service is created if there is at least
	// one port mapping.
	PortMappings []PortMapping `json:"portMappings"`

	// List of user-defined environment variables.
	Variables []EnvironmentVariable `json:"variables"`

	// Whether the created service is external.
	IsExternal bool `json:"isExternal"`

	// Description of the deployment.
	Description *string `json:"description"`

	// Target namespace of the application.
	Namespace string `json:"namespace"`

	// Optional memory requirement for the container.
	MemoryRequirement *resource.Quantity `json:"memoryRequirement"`

	// Optional CPU requirement for the container.
	CpuRequirement *resource.Quantity `json:"cpuRequirement"`

	// Labels that will be defined on Pods/RCs/Services
	Labels []Label `json:"labels"`

	// Whether to run the container as privileged user (essentially equivalent to root on the host).
	RunAsPrivileged bool `json:"runAsPrivileged"`
}

// Specification for deployment from file
type AppDeploymentFromFileSpec struct {
	// Name of the file
	Name string `json:"name"`

	// File content
	Content string `json:"content"`
}

// Port mapping for an application deployment.
type PortMapping struct {
	// Port that will be exposed on the service.
	Port int `json:"port"`

	// Docker image path for the application.
	TargetPort int32 `json:"targetPort"`

	// IP protocol for the mapping, e.g., "TCP" or "UDP".
	Protocol api.Protocol `json:"protocol"`
}

// EnvironmentVariable represents a named variable accessible for containers.
type EnvironmentVariable struct {
	// Name of the variable. Must be a C_IDENTIFIER.
	Name string `json:"name"`

	// Value of the variable, as defined in Kubernetes core API.
	Value string `json:"value"`
}

// Structure representing label assignable to Pod/RC/Service
type Label struct {
	// Label key
	Key string `json:"key"`

	// Label value
	Value string `json:"value"`
}

// Structure representing supported protocol types for a service
type Protocols struct {
	// Array containing supported protocol types e.g., ["TCP", "UDP"]
	Protocols []api.Protocol `json:"protocols"`
}

// Deploys an app based on the given configuration. The app is deployed using the given client.
// App deployment consists of a replication controller and an optional service. Both of them share
// common labels.
func DeployApp(spec *AppDeploymentSpec, client client.Interface) error {
	log.Printf("Deploying %s application into %s namespace", spec.Name, spec.Namespace)

	annotations := map[string]string{}
	if spec.Description != nil {
		annotations[DescriptionAnnotationKey] = *spec.Description
	}
	labels := getLabelsMap(spec.Labels)
	objectMeta := api.ObjectMeta{
		Annotations: annotations,
		Name:        spec.Name,
		Labels:      labels,
	}

	containerSpec := api.Container{
		Name:  spec.Name,
		Image: spec.ContainerImage,
		SecurityContext: &api.SecurityContext{
			Privileged: &spec.RunAsPrivileged,
		},
		Resources: api.ResourceRequirements{
			Requests: make(map[api.ResourceName]resource.Quantity),
		},
		Env: convertEnvVarsSpec(spec.Variables),
	}

	if spec.ContainerCommand != nil {
		containerSpec.Command = []string{*spec.ContainerCommand}
	}
	if spec.ContainerCommandArgs != nil {
		containerSpec.Args = []string{*spec.ContainerCommandArgs}
	}

	if spec.CpuRequirement != nil {
		containerSpec.Resources.Requests[api.ResourceCPU] = *spec.CpuRequirement
	}
	if spec.MemoryRequirement != nil {
		containerSpec.Resources.Requests[api.ResourceMemory] = *spec.MemoryRequirement
	}
	podSpec := api.PodSpec{
		Containers: []api.Container{containerSpec},
	}
	if spec.ImagePullSecret != nil {
		podSpec.ImagePullSecrets = []api.LocalObjectReference{{Name: *spec.ImagePullSecret}}
	}

	podTemplate := &api.PodTemplateSpec{
		ObjectMeta: objectMeta,
		Spec:       podSpec,
	}

	replicationController := &api.ReplicationController{
		ObjectMeta: objectMeta,
		Spec: api.ReplicationControllerSpec{
			Replicas: spec.Replicas,
			Selector: labels,
			Template: podTemplate,
		},
	}

	_, err := client.ReplicationControllers(spec.Namespace).Create(replicationController)

	if err != nil {
		// TODO(bryk): Roll back created resources in case of error.
		return err
	}

	if len(spec.PortMappings) > 0 {

		service := &api.Service{
			ObjectMeta: objectMeta,
			Spec: api.ServiceSpec{
				Selector: labels,
			},
		}

		if spec.IsExternal {
			service.Spec.Type = api.ServiceTypeLoadBalancer
		} else {
			service.Spec.Type = api.ServiceTypeNodePort
		}

		for _, portMapping := range spec.PortMappings {
			servicePort :=
				api.ServicePort{
					Protocol: portMapping.Protocol,
					Port:     portMapping.Port,
					Name:     generatePortMappingName(portMapping),
					TargetPort: intstr.IntOrString{
						Type:   intstr.Int,
						IntVal: portMapping.TargetPort,
					},
				}
			service.Spec.Ports = append(service.Spec.Ports, servicePort)
		}

		_, err = client.Services(spec.Namespace).Create(service)

		// TODO(bryk): Roll back created resources in case of error.
		return err
	} else {
		return nil
	}
}

func GetAvailableProtocols() *Protocols {
	return &Protocols{Protocols: []api.Protocol{api.ProtocolTCP, api.ProtocolUDP}}
}

func convertEnvVarsSpec(variables []EnvironmentVariable) []api.EnvVar {
	var result []api.EnvVar
	for _, variable := range variables {
		result = append(result, api.EnvVar{Name: variable.Name, Value: variable.Value})
	}
	return result
}

func generatePortMappingName(portMapping PortMapping) string {
	base := fmt.Sprintf("%s-%d-%d-", strings.ToLower(string(portMapping.Protocol)),
		portMapping.Port, portMapping.TargetPort)

	return api.SimpleNameGenerator.GenerateName(base)
}

// Converts array of labels to map[string]string
func getLabelsMap(labels []Label) map[string]string {
	result := make(map[string]string)

	for _, label := range labels {
		result[label.Key] = label.Value
	}

	return result
}

type createObjectFromInfo func(info *kubectlResource.Info) error

// Implementation of createObjectFromInfo
func CreateObjectFromInfoFn(info *kubectlResource.Info) error {
	_, err := kubectlResource.NewHelper(info.Client, info.Mapping).Create(info.Namespace, true, info.Object)
	return err
}

// Deploys an app based on the given yaml or json file.
func DeployAppFromFile(spec *AppDeploymentFromFileSpec, createObjectFromInfoFn createObjectFromInfo) error {
	const (
		validate      = true
		emptyCacheDir = ""
	)

	factory := cmdutil.NewFactory(nil)
	schema, err := factory.Validator(validate, emptyCacheDir)
	if err != nil {
		return err
	}

	mapper, typer := factory.Object()
	reader := strings.NewReader(spec.Content)

	r := kubectlResource.NewBuilder(mapper, typer, factory.ClientMapperForCommand()).
		Schema(schema).
		NamespaceParam(api.NamespaceDefault).DefaultNamespace().
		Stream(reader, spec.Name).
		Flatten().
		Do()

	return r.Visit(func(info *kubectlResource.Info, err error) error {
		err = createObjectFromInfoFn(info)
		if err != nil {
			return err
		}
		log.Printf("%s is deployed", info.Name)
		return nil
	})
}
