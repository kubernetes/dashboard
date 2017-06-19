// Copyright 2017 The Kubernetes Dashboard Authors.
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

	"github.com/kubernetes/dashboard/src/app/backend/resource/logs"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/pkg/api/v1"
)

// maximum number of lines loaded from the apiserver
var lineReadLimit int64 = 5000

// maximum number of bytes loaded from the apiserver
var byteReadLimit int64 = 500000

// PodContainerList is a list of containers of a pod.
type PodContainerList struct {
	Containers []string `json:"containers"`
}

// GetPodContainers returns containers that a pod has.
func GetPodContainers(client *client.Clientset, namespace, podID string) (*PodContainerList, error) {
	pod, err := client.Pods(namespace).Get(podID, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	containers := &PodContainerList{Containers: make([]string, 0)}

	for _, container := range pod.Spec.Containers {
		containers.Containers = append(containers.Containers, container.Name)
	}

	return containers, nil
}

// GetPodLogs returns logs for particular pod and container. When container
// is null, logs for the first one are returned.
func GetPodLogs(client *client.Clientset, namespace, podID string, container string,
	logSelector *logs.Selection) (*logs.LogDetails, error) {
	pod, err := client.Pods(namespace).Get(podID, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	if len(container) == 0 {
		container = pod.Spec.Containers[0].Name
	}

	logOptions := mapToLogOptions(container, logSelector)
	rawLogs, err := getRawPodLogs(client, namespace, podID, logOptions)
	if err != nil {
		return nil, err
	}
	details := ConstructLogs(podID, rawLogs, container, logSelector)
	return details, nil
}

// Maps the log selection to the corresponding api object
// Read limits are set to avoid out of memory issues
func mapToLogOptions(container string, logSelector *logs.Selection) *v1.PodLogOptions {
	logOptions := &v1.PodLogOptions{
		Container:  container,
		Follow:     false,
		Previous:   false,
		Timestamps: true,
	}

	if logSelector.LogFilePosition == logs.Beginning {
		logOptions.LimitBytes = &byteReadLimit
	} else {
		logOptions.TailLines = &lineReadLimit
	}

	return logOptions
}

// Construct a request for getting the logs for a pod and retrieves the logs.
func getRawPodLogs(client *client.Clientset, namespace, podID string, logOptions *v1.PodLogOptions) (
	string, error) {
	req := client.Core().RESTClient().Get().
		Namespace(namespace).
		Name(podID).
		Resource("pods").
		SubResource("log").
		VersionedParams(logOptions, scheme.ParameterCodec)

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

// Build logs structure for given parameters.
func ConstructLogs(podID string, rawLogs string, container string, logSelector *logs.Selection) *logs.LogDetails {
	parsedLines := logs.ToLogLines(rawLogs)
	logLines, fromDate, toDate, logSelection, lastPage := parsedLines.SelectLogs(logSelector)

	readLimitReached := isReadLimitReached(int64(len(rawLogs)), int64(len(parsedLines)), logSelector.LogFilePosition)
	truncated := readLimitReached && lastPage

	info := logs.LogInfo{
		PodName:       podID,
		ContainerName: container,
		FromDate:      fromDate,
		ToDate:        toDate,
		Truncated:     truncated,
	}
	return &logs.LogDetails{
		Info:      info,
		Selection: logSelection,
		LogLines:  logLines,
	}
}

// Checks if the amount of log file returned from the apiserver is equal to the read limits
func isReadLimitReached(bytesLoaded int64, linesLoaded int64, logFilePosition string) bool {
	return (logFilePosition == logs.Beginning && bytesLoaded >= byteReadLimit) ||
		(logFilePosition == logs.End && linesLoaded >= lineReadLimit)
}
