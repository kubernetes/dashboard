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
	api "k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/util"
)

// Configuration for an app deployment.
type AppDeployment struct {
	// Name of the application.
	Name string `json:"name"`

	// Docker image path for the application.
	ContainerImage string `json:"containerImage"`

	// Number of replicas of the image to maintain.
	Replicas int `json:"replicas"`

	// Port mappings for the service that is created. The service is created if there is at least
	// one port mapping.
	PortMappings []PortMapping `json:"portMappings"`

	// Whether the created service is external.
	IsExternal bool `json:"isExternal"`

	// Target namespace of the application.
	Namespace string `json:"namespace"`
}

// Port mapping for an application deployment.
type PortMapping struct {
	// Port that will be exposed on the service.
	Port int `json:"port"`

	// Docker image path for the application.
	TargetPort int `json:"targetPort"`

	// IP protocol for the mapping, e.g., "TCP" or "UDP".
	Protocol api.Protocol `json:"protocol"`
}

// Deploys an app based on the given configuration. The app is deployed using the given client.
// App deployment consists of a replication controller and an optional service. Both of them share
// common labels.
// TODO(bryk): Write tests for this function.
func DeployApp(deployment *AppDeployment, client *client.Client) error {
	podTemplate := &api.PodTemplateSpec{
		ObjectMeta: api.ObjectMeta{
			Labels: map[string]string{"name": deployment.Name},
		},
		Spec: api.PodSpec{
			Containers: []api.Container{{
				Name:  deployment.Name,
				Image: deployment.ContainerImage,
			}},
		},
	}

	replicaSet := &api.ReplicationController{
		ObjectMeta: api.ObjectMeta{
			Name: deployment.Name,
		},
		Spec: api.ReplicationControllerSpec{
			Replicas: deployment.Replicas,
			Selector: map[string]string{"name": deployment.Name},
			Template: podTemplate,
		},
	}

	_, err := client.ReplicationControllers(deployment.Namespace).Create(replicaSet)

	if err != nil {
		// TODO(bryk): Roll back created resources in case of error.
		return err
	}

	if len(deployment.PortMappings) > 0 {
		service := &api.Service{
			ObjectMeta: api.ObjectMeta{
				Name:   deployment.Name,
				Labels: map[string]string{"name": deployment.Name},
			},
			Spec: api.ServiceSpec{
				Selector: map[string]string{"name": deployment.Name},
			},
		}

		if deployment.IsExternal {
			service.Spec.Type = api.ServiceTypeLoadBalancer
		} else {
			service.Spec.Type = api.ServiceTypeNodePort
		}

		for _, portMapping := range deployment.PortMappings {
			servicePort :=
				api.ServicePort{
					Protocol: portMapping.Protocol,
					Port:     portMapping.Port,
					TargetPort: util.IntOrString{
						Kind:   util.IntstrInt,
						IntVal: portMapping.TargetPort,
					},
				}
			service.Spec.Ports = append(service.Spec.Ports, servicePort)
		}

		_, err = client.Services(deployment.Namespace).Create(service)

		// TODO(bryk): Roll back created resources in case of error.

		return err
	} else {
		return nil
	}
}
