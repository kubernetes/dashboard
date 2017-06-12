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

package scope

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/kubernetes/dashboard/src/app/backend/resource/deployment"
	client "k8s.io/client-go/kubernetes"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Scope structure contains two fields, deployed indicating whether scope has been deployed
// onto the cluster, and address which is the publicly accessible address of scope.
type Scope struct {
	Deployed bool   `json:"deployed"`
	Address  string `json:"address"`
}

// PostScope deploys Scope onto the cluster.
func PostScope(client client.Interface) (*Scope, error) {
	log.Print("Installing scope on the cluster")

	response, err := http.Get("https://raw.githubusercontent.com/kubernetes/dashboard/master/src/app/backend/resource/scope/scope.yaml")

	if err != nil {
		log.Print(err)
		return &Scope{}, nil
	}

	defer response.Body.Close()
	body, err := ioutil.ReadAll(response.Body)

	spec := &deployment.AppDeploymentFromFileSpec{
		Name:      "scope",
		Namespace: "kube-system",
		Content:   string(body),
		Validate:  true,
	}

	isDeploy, err := deployment.DeployAppFromFile(spec, deployment.CreateObjectFromInfoFn)

	if !isDeploy {
		log.Print("Something went wrong with deploying scope")
		if err != nil {
			log.Print(err)
		}
	}

	return &Scope{}, nil
}

// GetScope returns a populated Scope struct.
func GetScope(client client.Interface) (*Scope, error) {
	log.Print("Checking whether scope is running on the cluster")
	r := false
	a := ""

	svc, err := client.CoreV1().Services("").List(metav1.ListOptions{LabelSelector: "name=weave-scope-app"})
	pod, err := client.CoreV1().Pods("").List(metav1.ListOptions{LabelSelector: "name=weave-scope-app"})

	if err != nil {
		log.Print(err)
	} else {
		if len(svc.Items) > 0 && len(pod.Items) > 0 {
			status := pod.Items[0].Status.Phase
			if status == "Running" {
				l := pod.Items[0].Status.HostIP
				p := strconv.FormatInt(int64(svc.Items[0].Spec.Ports[0].NodePort), 10)
				r = true
				a = fmt.Sprintf("http://%s:%s", l, p)
			}
		}
	}

	scope := &Scope{
		Deployed: r,
		Address:  a,
	}

	return scope, err
}
