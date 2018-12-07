/*
Copyright 2018 The Kubernetes Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package testutil

import (
	"io"
	"os"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/util/json"
	"k8s.io/apimachinery/pkg/util/yaml"

	applicationsv1beta1 "github.com/kubernetes-sigs/application/pkg/apis/app/v1beta1"
	appcs "github.com/kubernetes-sigs/application/pkg/client/clientset/versioned"
)

func CreateApplication(kubeClient appcs.Interface, ns string, relativePath string) error {
	app, err := parseApplicationYaml(relativePath)
	if err != nil {
		return err
	}

	_, err = kubeClient.AppV1beta1().Applications(ns).Get(app.Name, metav1.GetOptions{})

	if err == nil {
		// Application already exists -> Update
		_, err = kubeClient.AppV1beta1().Applications(ns).Update(app)
		if err != nil {
			return err
		}

	} else {
		// Application doesn't exist -> Create
		_, err = kubeClient.AppV1beta1().Applications(ns).Create(app)
		if err != nil {
			return err
		}
	}

	return nil
}

func DeleteApplication(kubeClient appcs.Interface, ns string, relativePath string) error {
	app, err := parseApplicationYaml(relativePath)
	if err != nil {
		return err
	}

	if err := kubeClient.AppV1beta1().Applications(ns).Delete(app.Name, &metav1.DeleteOptions{}); err != nil {
		return err
	}

	return nil
}

func parseApplicationYaml(relativePath string) (*applicationsv1beta1.Application, error) {
	var manifest *os.File
	var err error

	var app applicationsv1beta1.Application
	if manifest, err = PathToOSFile(relativePath); err != nil {
		return nil, err
	}

	decoder := yaml.NewYAMLOrJSONDecoder(manifest, 100)
	for {
		var out unstructured.Unstructured
		err = decoder.Decode(&out)
		if err != nil {
			// this would indicate it's malformed YAML.
			break
		}

		if out.GetKind() == "Application" {
			var marshaled []byte
			marshaled, err = out.MarshalJSON()
			json.Unmarshal(marshaled, &app)
			break
		}
	}

	if err != io.EOF && err != nil {
		return nil, err
	}
	return &app, nil
}
