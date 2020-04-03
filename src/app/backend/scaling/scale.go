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

package scaling

import (
	"context"
	"strconv"

	apps "k8s.io/api/apps/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/discovery/cached/memory"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/restmapper"
	"k8s.io/client-go/scale"
)

// ReplicaCounts provide the desired and actual number of replicas.
type ReplicaCounts struct {
	DesiredReplicas int32 `json:"desiredReplicas"`
	ActualReplicas  int32 `json:"actualReplicas"`
}

// GetReplicaCounts returns a populated ReplicaCounts object with desired and actual number of replicas.
func GetReplicaCounts(cfg *rest.Config, kind, namespace, name string) (*ReplicaCounts, error) {
	sc, err := getScaleGetter(cfg)
	if err != nil {
		return nil, err
	}

	gr := getGroupResource(kind)
	res, err := sc.Scales(namespace).Get(context.TODO(), gr, name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return &ReplicaCounts{
		ActualReplicas:  res.Status.Replicas,
		DesiredReplicas: res.Spec.Replicas,
	}, nil
}

// ScaleResource scales the provided resource using the client scale method in the case of Deployment,
// ReplicaSet, Replication Controller. In the case of a job we are using the jobs resource update
// method since the client scale method does not provide one for the job.
func ScaleResource(cfg *rest.Config, kind, namespace, name, count string) (*ReplicaCounts, error) {
	sc, err := getScaleGetter(cfg)
	if err != nil {
		return nil, err
	}

	gr := getGroupResource(kind)
	res, err := sc.Scales(namespace).Get(context.TODO(), gr, name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	c, err := strconv.Atoi(count)
	if err != nil {
		return nil, err
	}

	res.Spec.Replicas = int32(c)

	res, err = sc.Scales(namespace).Update(context.TODO(), gr, res, metaV1.UpdateOptions{})
	if err != nil {
		return nil, err
	}

	return &ReplicaCounts{
		ActualReplicas:  res.Status.Replicas,
		DesiredReplicas: res.Spec.Replicas,
	}, nil
}

func getScaleGetter(cfg *rest.Config) (scale.ScalesGetter, error) {
	discoveryClient, err := discovery.NewDiscoveryClientForConfig(cfg)
	if err != nil {
		return nil, err
	}

	cfg.GroupVersion = &apps.SchemeGroupVersion
	cfg.NegotiatedSerializer = scheme.Codecs

	restClient, err := rest.RESTClientFor(cfg)
	if err != nil {
		return nil, err
	}

	resolver := scale.NewDiscoveryScaleKindResolver(discoveryClient)
	dc := memory.NewMemCacheClient(discoveryClient)
	drm := restmapper.NewDeferredDiscoveryRESTMapper(dc)

	// Fixes "unable to get full preferred group-version-resource for <resource>: the cache has not been filled yet".
	// See more: https://github.com/kubernetes/kubernetes/issues/68735
	drm.Reset()

	return scale.New(restClient, drm, dynamic.LegacyAPIPathResolverFunc, resolver), nil
}

func getGroupResource(kind string) schema.GroupResource {
	gr := schema.ParseGroupResource(kind)

	if gr.Group != "" && gr.Resource != "" {
		return gr
	}

	return apps.Resource(kind)
}
