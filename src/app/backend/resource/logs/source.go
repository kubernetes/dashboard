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

package logs

import "github.com/kubernetes/dashboard/src/app/backend/resource/generic"
import "github.com/kubernetes/dashboard/src/app/backend/resource/common"
import client "k8s.io/client-go/kubernetes"
import meta "k8s.io/apimachinery/pkg/apis/meta/v1"
import "k8s.io/client-go/pkg/api/v1"

// Returns all log sources for a given resource. A log source identifies a log file through the combination of pod & container
func GetLogSources(k8sClient *client.Clientset, ns string, resourceName string, resourceType string) (generic.LogSources, error) {
	if resourceType == "Pod" {
		return getLogSourcesFromPod(k8sClient, ns, resourceName)
	} else {
		return getLogSourcesFromController(k8sClient, ns, resourceName, resourceType)
	}
}

// Returns all containers for a given pod
func getLogSourcesFromPod(k8sClient *client.Clientset, ns, resourceName string) (generic.LogSources, error) {
	logSources := generic.LogSources{}
	pod, err := k8sClient.CoreV1().Pods(ns).Get(resourceName, meta.GetOptions{})
	if err != nil {
		return logSources, err
	}
	logSources.ContainerNames = common.GetContainerNames(&pod.Spec)
	logSources.PodNames = []string{resourceName}
	return logSources, nil
}

// Returns all pods and containers for a controller object, such as ReplicaSEt
func getLogSourcesFromController(k8sClient *client.Clientset, ns, resourceName, resourceType string) (generic.LogSources, error) {
	logSources := generic.LogSources{}
	rc, err := generic.NewResourceController(v1.ObjectReference{Kind: resourceType, Name: resourceName, Namespace: ns}, k8sClient)
	if err != nil {
		return logSources, err
	}
	logSources = rc.GetLogSources(k8sClient)
	return logSources, nil
}
