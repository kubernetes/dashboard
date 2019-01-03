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
	"k8s.io/client-go/restmapper"
	"strconv"
	"strings"

	"k8s.io/api/extensions/v1beta1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/discovery"
	cacheddiscovery "k8s.io/client-go/discovery/cached"
	"k8s.io/client-go/dynamic"
	client "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/scale"
	"k8s.io/client-go/scale/scheme/appsv1beta2"
)

// ReplicaCounts provide the desired and actual number of replicas.
type ReplicaCounts struct {
	DesiredReplicas int32 `json:"desiredReplicas"`
	ActualReplicas  int32 `json:"actualReplicas"`
}

// GetScaleSpec returns a populated ReplicaCounts object with desired and actual number of replicas.
func GetScaleSpec(cfg *rest.Config, kind, namespace, name string) (*ReplicaCounts, error) {
	discoveryClient, err := discovery.NewDiscoveryClientForConfig(cfg)
	if err != nil {
		return nil, err
	}

	cfg.GroupVersion = &appsv1beta2.SchemeGroupVersion
	cfg.NegotiatedSerializer = scheme.Codecs

	restClient, err := rest.RESTClientFor(cfg)
	if err != nil {
		return nil, err
	}

	resolver := scale.NewDiscoveryScaleKindResolver(discoveryClient)
	dc := cacheddiscovery.NewMemCacheClient(discoveryClient)
	drm := restmapper.NewDeferredDiscoveryRESTMapper(dc)
	sc := scale.New(restClient, drm, dynamic.LegacyAPIPathResolverFunc, resolver)

	res, err := sc.Scales(namespace).Get(appsv1beta2.Resource(kind), name)
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
func ScaleResource(cfg *rest.Config, client client.Interface, kind, namespace, name, count string) (rc *ReplicaCounts, err error) {
	rc = new(ReplicaCounts)
	if strings.ToLower(kind) == "job" {
		err = scaleJobResource(client, namespace, name, count, rc)
	} else if strings.ToLower(kind) == "statefulset" {
		err = scaleStatefulSetResource(client, namespace, name, count, rc)
	} else {
		discoveryClient, err := discovery.NewDiscoveryClientForConfig(cfg)
		if err != nil {
			return nil, err
		}
		err = scaleGenericResource(discoveryClient, client, kind, namespace, name, count)
	}
	if err != nil {
		return nil, err
	}

	return
}

//ScaleGenericResource is used for Deployment, ReplicaSet, Replication Controller scaling.
func scaleGenericResource(discoveryClient *discovery.DiscoveryClient, client client.Interface, kind, namespace, name, count string) error {
	result := &v1beta1.Scale{}

	err := discoveryClient.RESTClient().Get().Namespace(namespace).Resource(kind+"s").Name(name).
		SubResource("scale").VersionedParams(&metaV1.GetOptions{}, scheme.ParameterCodec).Do().Into(result)
	if err != nil {
		return err
	}

	c, err := strconv.Atoi(count)
	if err != nil {
		return err
	}

	// Update replicas count.
	result.Spec.Replicas = int32(c)

	return client.Discovery().RESTClient().Put().Namespace(namespace).Resource(kind + "s").Name(name).
		SubResource("scale").Body(result).Do().Into(result)
}

// scaleJobResource is exclusively used for jobs as it does not increase/decrease pods but jobs parallelism attribute.
func scaleJobResource(client client.Interface, namespace, name, count string, rc *ReplicaCounts) error {
	j, err := client.BatchV1().Jobs(namespace).Get(name, metaV1.GetOptions{})
	if err != nil {
		return err
	}

	c, err := strconv.Atoi(count)
	if err != nil {
		return err
	}

	*j.Spec.Parallelism = int32(c)
	j, err = client.BatchV1().Jobs(namespace).Update(j)
	if err != nil {
		return err
	}

	rc.DesiredReplicas = *j.Spec.Parallelism
	rc.ActualReplicas = *j.Spec.Parallelism

	return nil
}

// scaleStatefulSet is exclusively used for stateful sets.
func scaleStatefulSetResource(client client.Interface, namespace, name, count string, rc *ReplicaCounts) error {
	ss, err := client.AppsV1().StatefulSets(namespace).Get(name, metaV1.GetOptions{})
	if err != nil {
		return err
	}

	c, err := strconv.Atoi(count)
	if err != nil {
		return err
	}

	*ss.Spec.Replicas = int32(c)
	ss, err = client.AppsV1().StatefulSets(namespace).Update(ss)
	if err != nil {
		return err
	}

	rc.DesiredReplicas = *ss.Spec.Replicas
	rc.ActualReplicas = ss.Status.Replicas

	return nil
}
