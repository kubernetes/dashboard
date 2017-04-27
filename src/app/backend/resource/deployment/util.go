package deployment

import (
	"fmt"

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/client-go/pkg/api/helper"
	"k8s.io/client-go/pkg/api/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

// Methods below are taken from kubernetes repo:
// https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/deployment/util/deployment_util.go

// FindNewReplicaSet returns the new RS this given deployment targets (the one with the same pod template).
func FindNewReplicaSet(deployment *extensions.Deployment, rsList []*extensions.ReplicaSet) (*extensions.ReplicaSet, error) {
	newRSTemplate := GetNewReplicaSetTemplate(deployment)
	for i := range rsList {
		if EqualIgnoreHash(rsList[i].Spec.Template, newRSTemplate) {
			// This is the new ReplicaSet.
			return rsList[i], nil
		}
	}
	// new ReplicaSet does not exist.
	return nil, nil
}

// FindOldReplicaSets returns the old replica sets targeted by the given Deployment, with the given
// PodList and slice of RSes. Note that the first set of old replica sets doesn't include the ones
// with no pods, and the second set of old replica sets include all old replica sets.
// Logic taken from: https://github.com/kubernetes/kubernetes/blob/b5f9d56cab78ccaad2b726223ba8be5802026f0b/pkg/controller/deployment/util/deployment_util.go#L623
func FindOldReplicaSets(deployment *extensions.Deployment, rsList []*extensions.ReplicaSet,
	podList *v1.PodList) ([]*extensions.ReplicaSet, []*extensions.ReplicaSet, error) {
	// Find all pods whose labels match deployment.Spec.Selector, and corresponding replica sets for pods in podList.
	// All pods and replica sets are labeled with pod-template-hash to prevent overlapping
	oldRSs := map[string]*extensions.ReplicaSet{}
	allOldRSs := map[string]*extensions.ReplicaSet{}
	newRSTemplate := GetNewReplicaSetTemplate(deployment)
	for _, pod := range podList.Items {
		podLabelsSelector := labels.Set(pod.ObjectMeta.Labels)
		for _, rs := range rsList {
			rsLabelsSelector, err := metaV1.LabelSelectorAsSelector(rs.Spec.Selector)
			if err != nil {
				return nil, nil, fmt.Errorf("invalid label selector: %v", err)
			}
			// Filter out replica set that has the same pod template spec as the deployment - that is the new replica set.
			if EqualIgnoreHash(rs.Spec.Template, newRSTemplate) {
				continue
			}
			allOldRSs[rs.ObjectMeta.Name] = rs
			if rsLabelsSelector.Matches(podLabelsSelector) {
				oldRSs[rs.ObjectMeta.Name] = rs
			}
		}
	}
	requiredRSs := []*extensions.ReplicaSet{}
	for key := range oldRSs {
		value := oldRSs[key]
		requiredRSs = append(requiredRSs, value)
	}
	allRSs := []*extensions.ReplicaSet{}
	for key := range allOldRSs {
		value := allOldRSs[key]
		allRSs = append(allRSs, value)
	}
	return requiredRSs, allRSs, nil
}

// GetNewReplicaSetTemplate returns the desired PodTemplateSpec for the new ReplicaSet corresponding to the given ReplicaSet.
// Callers of this helper need to set the DefaultDeploymentUniqueLabelKey k/v pair.
func GetNewReplicaSetTemplate(deployment *extensions.Deployment) v1.PodTemplateSpec {
	// newRS will have the same template as in deployment spec.
	return v1.PodTemplateSpec{
		ObjectMeta: deployment.Spec.Template.ObjectMeta,
		Spec:       deployment.Spec.Template.Spec,
	}
}

// EqualIgnoreHash returns true if two given podTemplateSpec are equal, ignoring the diff in value of Labels[pod-template-hash]
// We ignore pod-template-hash because the hash result would be different upon podTemplateSpec API changes
// (e.g. the addition of a new field will cause the hash code to change)
// Note that we assume input podTemplateSpecs contain non-empty labels
func EqualIgnoreHash(template1, template2 v1.PodTemplateSpec) bool {
	// First, compare template.Labels (ignoring hash)
	labels1, labels2 := template1.Labels, template2.Labels
	if len(labels1) > len(labels2) {
		labels1, labels2 = labels2, labels1
	}
	// We make sure len(labels2) >= len(labels1)
	for k, v := range labels2 {
		if labels1[k] != v && k != extensions.DefaultDeploymentUniqueLabelKey {
			return false
		}
	}
	// Then, compare the templates without comparing their labels
	template1.Labels, template2.Labels = nil, nil
	return helper.Semantic.DeepEqual(template1, template2)
}
