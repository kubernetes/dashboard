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

package client

import (
	"fmt"
	"log"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/labels"

	"k8s.io/helm/pkg/helm"
	"k8s.io/helm/pkg/kube"
)

const (
	tillerNamespace = "kube-system"
	tillerPort      = 44134
)

func CreateHelmTillerClient() (*helm.Client, error) {
	tunnel, err := newTillerPortForwarder(tillerNamespace)
	if err != nil {
		return nil, err
	}
	log.Printf("Created tunnel using local port: '%d'", tunnel.Local)
	tillerHost := fmt.Sprintf(":%d", tunnel.Local)
	log.Printf("Creating tiller client using host: %q", tillerHost)
	tillerClient := helm.NewClient(helm.Host(tillerHost))
	return tillerClient, nil
}

// TODO: refactor out this global var
var tunnel *kube.Tunnel

func newTillerPortForwarder(namespace string) (*kube.Tunnel, error) {
	kc := kube.New(nil)
	client, err := kc.APIClient()
	if err != nil {
		return nil, err
	}
	podName, err := getTillerPodName(client, namespace)
	if err != nil {
		return nil, err
	}
	log.Printf("tiller pod found: %q", podName)
	return kc.ForwardPort(namespace, podName, tillerPort)
}

func getTillerPodName(client unversioned.PodsNamespacer, namespace string) (string, error) {
	// TODO: use a const for labels
	selector := labels.Set{"app": "helm", "name": "tiller"}.AsSelector()
	pod, err := getFirstRunningPod(client, namespace, selector)
	if err != nil {
		return "", err
	}
	return pod.ObjectMeta.GetName(), nil
}

func getFirstRunningPod(client unversioned.PodsNamespacer, namespace string, selector labels.Selector) (*api.Pod, error) {
	options := api.ListOptions{LabelSelector: selector}
	pods, err := client.Pods(namespace).List(options)
	if err != nil {
		return nil, err
	}
	if len(pods.Items) < 1 {
		return nil, fmt.Errorf("could not find tiller")
	}
	for _, p := range pods.Items {
		if api.IsPodReady(&p) {
			return &p, nil
		}
	}
	return nil, fmt.Errorf("could not find a ready pod")
}
