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

package setimage

import (
	"context"
	"encoding/json"
	apps "k8s.io/api/apps/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	types "k8s.io/apimachinery/pkg/types"
	client "k8s.io/client-go/kubernetes"
	"k8s.io/dashboard/api/pkg/errors"
)

type SetImageData struct {
	Name  string `json:"name"`
	Image string `json:"image"`
}

type patchDeploymentSpecTemplateSpecContainers struct {
	Containers []SetImageData `json:"containers"`
}

type patchDeploymentSpecTemplateSpec struct {
	Spec patchDeploymentSpecTemplateSpecContainers `json:"spec"`
}

type patchDeploymentSpecTemplate struct {
	Template patchDeploymentSpecTemplateSpec `json:"template"`
}

type patchDeploymentSpec struct {
	Spec patchDeploymentSpecTemplate `json:"spec"`
}

// this is equivalente to kubectl set image -n NAMESPACE deployment/DEPLOYMENT_NAME CONTAINER_NAME=CONTAINER_IMAGE

// it actually patches the target k8s object (currently deployments only) so it's container image can be replaced, just like kubectl
// useful references:
// https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/

func SetImage(client client.Interface, kind string, namespace string, name string, setImageData *SetImageData) (*apps.Deployment, error) {

	if kind != "deployment" {
		return nil, errors.NewInvalid("Currently, only deployments are supported by SetImage")
	}

	patchedDeployment, err := patchDeploymentContainer(client, namespace, name, setImageData)
	if err != nil {
		return nil, err
	}

	return patchedDeployment, nil
}

func patchDeploymentContainer(client client.Interface, namespace string, name string, setImageData *SetImageData) (*apps.Deployment, error) {

	payload := patchDeploymentSpec{
		Spec: patchDeploymentSpecTemplate{
			Template: patchDeploymentSpecTemplateSpec{
				Spec: patchDeploymentSpecTemplateSpecContainers{
					Containers: []SetImageData{
						*setImageData,
					},
				},
			},
		},
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	patchOptions := metaV1.PatchOptions{}

	patchedDeployment, err := client.AppsV1().Deployments(namespace).Patch(
		context.TODO(), name,
		types.StrategicMergePatchType,
		payloadBytes, patchOptions)

	if err != nil {
		return nil, err
	}

	return patchedDeployment, nil
}
