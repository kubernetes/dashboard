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
	"math/rand"
	"strconv"
	"time"

	api "k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// Configuration for an app deployment.
type DeployAppConfig struct {
	// Name of the application.
	AppName string `json:"appName"`

	// Docker image path for the application.
	ContainerImage string `json:"containerImage"`
}

// Deploys an app based on the given configuration. The app is deployed using the given client.
func DeployApp(config *DeployAppConfig, client *client.Client) error {
	// TODO(bryk): The implementation below is just for tests. To complete an end-to-end setup of
	// the project. It'll be replaced with a real implementation.
	rand.Seed(time.Now().UTC().UnixNano())
	podName := config.AppName + "-" + strconv.Itoa(rand.Intn(10000))

	pod := api.Pod{
		ObjectMeta: api.ObjectMeta{
			Name: podName,
		},
		Spec: api.PodSpec{
			Containers: []api.Container{{
				Name:  config.AppName,
				Image: config.ContainerImage,
			}},
		},
	}

	_, err := client.Pods(api.NamespaceDefault).Create(&pod)

	return err
}
