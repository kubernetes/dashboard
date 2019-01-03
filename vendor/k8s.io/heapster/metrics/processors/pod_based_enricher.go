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

package processors

import (
	"fmt"

	"github.com/golang/glog"

	"k8s.io/heapster/metrics/util"

	v1listers "k8s.io/client-go/listers/core/v1"
	kube_api "k8s.io/client-go/pkg/api/v1"
	"k8s.io/heapster/metrics/core"
)

type PodBasedEnricher struct {
	podLister   v1listers.PodLister
	labelCopier *util.LabelCopier
}

func (this *PodBasedEnricher) Name() string {
	return "pod_based_enricher"
}

func (this *PodBasedEnricher) Process(batch *core.DataBatch) (*core.DataBatch, error) {
	newMs := make(map[string]*core.MetricSet, len(batch.MetricSets))
	for k, v := range batch.MetricSets {
		switch v.Labels[core.LabelMetricSetType.Key] {
		case core.MetricSetTypePod:
			namespace := v.Labels[core.LabelNamespaceName.Key]
			podName := v.Labels[core.LabelPodName.Key]
			pod, err := this.getPod(namespace, podName)
			if err != nil {
				glog.V(3).Infof("Failed to get pod %s from cache: %v", core.PodKey(namespace, podName), err)
				continue
			}
			this.addPodInfo(k, v, pod, batch, newMs)
		case core.MetricSetTypePodContainer:
			namespace := v.Labels[core.LabelNamespaceName.Key]
			podName := v.Labels[core.LabelPodName.Key]
			pod, err := this.getPod(namespace, podName)
			if err != nil {
				glog.V(3).Infof("Failed to get pod %s from cache: %v", core.PodKey(namespace, podName), err)
				continue
			}
			this.addContainerInfo(k, v, pod, batch, newMs)
		}
	}
	for k, v := range newMs {
		batch.MetricSets[k] = v
	}
	return batch, nil
}

func (this *PodBasedEnricher) getPod(namespace, name string) (*kube_api.Pod, error) {
	pod, err := this.podLister.Pods(namespace).Get(name)
	if err != nil {
		return nil, err
	}
	if pod == nil {
		return nil, fmt.Errorf("cannot find pod definition")
	}
	return pod, nil
}

func (this *PodBasedEnricher) addContainerInfo(key string, containerMs *core.MetricSet, pod *kube_api.Pod, batch *core.DataBatch, newMs map[string]*core.MetricSet) {
	for _, container := range pod.Spec.Containers {
		if key == core.PodContainerKey(pod.Namespace, pod.Name, container.Name) {
			updateContainerResourcesAndLimits(containerMs, container)
			if _, ok := containerMs.Labels[core.LabelContainerBaseImage.Key]; !ok {
				containerMs.Labels[core.LabelContainerBaseImage.Key] = container.Image
			}
			break
		}
	}

	for _, containerStatus := range pod.Status.ContainerStatuses {
		if key == core.PodContainerKey(pod.Namespace, pod.Name, containerStatus.Name) {
			containerMs.MetricValues[core.MetricRestartCount.Name] = intValue(int64(containerStatus.RestartCount))
			if !pod.Status.StartTime.IsZero() {
				containerMs.EntityCreateTime = pod.Status.StartTime.Time
			}
			break
		}
	}

	containerMs.Labels[core.LabelPodId.Key] = string(pod.UID)
	this.labelCopier.Copy(pod.Labels, containerMs.Labels)

	namespace := containerMs.Labels[core.LabelNamespaceName.Key]
	podName := containerMs.Labels[core.LabelPodName.Key]

	podKey := core.PodKey(namespace, podName)
	_, oldfound := batch.MetricSets[podKey]
	if !oldfound {
		_, newfound := newMs[podKey]
		if !newfound {
			glog.V(2).Infof("Pod %s not found, creating a stub", podKey)
			podMs := &core.MetricSet{
				MetricValues: make(map[string]core.MetricValue),
				Labels: map[string]string{
					core.LabelMetricSetType.Key: core.MetricSetTypePod,
					core.LabelNamespaceName.Key: namespace,
					core.LabelPodName.Key:       podName,
					core.LabelNodename.Key:      containerMs.Labels[core.LabelNodename.Key],
					core.LabelHostname.Key:      containerMs.Labels[core.LabelHostname.Key],
					core.LabelHostID.Key:        containerMs.Labels[core.LabelHostID.Key],
				},
			}
			if !pod.Status.StartTime.IsZero() {
				podMs.EntityCreateTime = pod.Status.StartTime.Time
			}
			newMs[podKey] = podMs
			this.addPodInfo(podKey, podMs, pod, batch, newMs)
		}
	}
}

func (this *PodBasedEnricher) addPodInfo(key string, podMs *core.MetricSet, pod *kube_api.Pod, batch *core.DataBatch, newMs map[string]*core.MetricSet) {

	// Add UID and create time to pod
	podMs.Labels[core.LabelPodId.Key] = string(pod.UID)
	if !pod.Status.StartTime.IsZero() {
		podMs.EntityCreateTime = pod.Status.StartTime.Time
	}
	this.labelCopier.Copy(pod.Labels, podMs.Labels)

	// Add cpu/mem requests and limits to containers
	for _, container := range pod.Spec.Containers {
		containerKey := core.PodContainerKey(pod.Namespace, pod.Name, container.Name)
		if _, found := batch.MetricSets[containerKey]; found {
			continue
		}
		if _, found := newMs[containerKey]; found {
			continue
		}
		glog.V(2).Infof("Container %s not found, creating a stub", containerKey)
		containerMs := &core.MetricSet{
			MetricValues: make(map[string]core.MetricValue),
			Labels: map[string]string{
				core.LabelMetricSetType.Key:      core.MetricSetTypePodContainer,
				core.LabelNamespaceName.Key:      pod.Namespace,
				core.LabelPodName.Key:            pod.Name,
				core.LabelContainerName.Key:      container.Name,
				core.LabelContainerBaseImage.Key: container.Image,
				core.LabelPodId.Key:              string(pod.UID),
				core.LabelNodename.Key:           podMs.Labels[core.LabelNodename.Key],
				core.LabelHostname.Key:           podMs.Labels[core.LabelHostname.Key],
				core.LabelHostID.Key:             podMs.Labels[core.LabelHostID.Key],
			},
			EntityCreateTime: podMs.CollectionStartTime,
		}
		this.labelCopier.Copy(pod.Labels, containerMs.Labels)
		updateContainerResourcesAndLimits(containerMs, container)
		newMs[containerKey] = containerMs
	}
}

func updateContainerResourcesAndLimits(metricSet *core.MetricSet, container kube_api.Container) {
	requests := container.Resources.Requests
	if val, found := requests[kube_api.ResourceCPU]; found {
		metricSet.MetricValues[core.MetricCpuRequest.Name] = intValue(val.MilliValue())
	} else {
		metricSet.MetricValues[core.MetricCpuRequest.Name] = intValue(0)
	}
	if val, found := requests[kube_api.ResourceMemory]; found {
		metricSet.MetricValues[core.MetricMemoryRequest.Name] = intValue(val.Value())
	} else {
		metricSet.MetricValues[core.MetricMemoryRequest.Name] = intValue(0)
	}

	limits := container.Resources.Limits
	if val, found := limits[kube_api.ResourceCPU]; found {
		metricSet.MetricValues[core.MetricCpuLimit.Name] = intValue(val.MilliValue())
	} else {
		metricSet.MetricValues[core.MetricCpuLimit.Name] = intValue(0)
	}
	if val, found := limits[kube_api.ResourceMemory]; found {
		metricSet.MetricValues[core.MetricMemoryLimit.Name] = intValue(val.Value())
	} else {
		metricSet.MetricValues[core.MetricMemoryLimit.Name] = intValue(0)
	}
}

func intValue(value int64) core.MetricValue {
	return core.MetricValue{
		IntValue:   value,
		MetricType: core.MetricGauge,
		ValueType:  core.ValueInt64,
	}
}

func NewPodBasedEnricher(podLister v1listers.PodLister, labelCopier *util.LabelCopier) (*PodBasedEnricher, error) {
	return &PodBasedEnricher{
		podLister:   podLister,
		labelCopier: labelCopier,
	}, nil
}
