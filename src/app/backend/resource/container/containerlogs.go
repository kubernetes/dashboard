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

package container

import (
	"io/ioutil"
	"log"
	"strings"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// Logs is a representation of logs response structure.
type Logs struct {
	// Pod name.
	PodId string `json:"podId"`

	// Specific time when logs started.
	SinceTime unversioned.Time `json:"sinceTime"`

	// Logs string lines.
	Logs []string `json:"logs"`

	// The name of the container the logs are for.
	Container string `json:"container"`
}

// PodContainerList is a list of containers of a pod.
type PodContainerList struct {
	Containers []string `json:"containers"`
}

// GetPodContainers returns containers that a pod has.
func GetPodContainers(client *client.Client, namespace, podID string) (*PodContainerList, error) {
	log.Printf("Getting containers from %s pod in %s namespace", podID, namespace)

	pod, err := client.Pods(namespace).Get(podID)
	if err != nil {
		return nil, err
	}

	containers := &PodContainerList{Containers: make([]string, 0)}

	for _, container := range pod.Spec.Containers {
		containers.Containers = append(containers.Containers, container.Name)
	}

	return containers, nil
}

// GetPodLogs returns logs for particular pod and container or error when occurred. When container
// is null, logs for the first one are returned.
func GetPodLogs(client *client.Client, namespace, podID string, container string) (*Logs, error) {
	log.Printf("Getting logs from %s container from %s pod in %s namespace", container, podID,
		namespace)

	pod, err := client.Pods(namespace).Get(podID)
	if err != nil {
		return nil, err
	}

	if len(container) == 0 {
		container = pod.Spec.Containers[0].Name
	}

	logOptions := &api.PodLogOptions{
		Container:  container,
		Follow:     false,
		Previous:   false,
		Timestamps: true,
	}

	rawLogs, err := getRawPodLogs(client, namespace, podID, logOptions)
	if err != nil {
		return nil, err
	}

	return ConstructLogs(podID, pod.CreationTimestamp, rawLogs, container), nil
}

// Construct a request for getting the logs for a pod and retrieves the logs.
func getRawPodLogs(client *client.Client, namespace, podID string, logOptions *api.PodLogOptions) (
	string, error) {
	req := client.RESTClient.Get().
		Namespace(namespace).
		Name(podID).
		Resource("pods").
		SubResource("log").
		VersionedParams(logOptions, api.ParameterCodec)

	readCloser, err := req.Stream()
	if err != nil {
		return err.Error(), nil
	}

	defer readCloser.Close()

	result, err := ioutil.ReadAll(readCloser)
	if err != nil {
		return "", err
	}

	return string(result), nil
}

// ConstructLogs constructs logs structure for given parameters.
func ConstructLogs(podID string, sinceTime unversioned.Time, rawLogs string, container string) *Logs {
	logs := &Logs{
		PodId:     podID,
		SinceTime: sinceTime,
		Logs:      strings.Split(rawLogs, "\n"),
		Container: container,
	}
	return logs
}
