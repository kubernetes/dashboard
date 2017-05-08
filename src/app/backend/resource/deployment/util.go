package deployment

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/client-go/pkg/api/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

// Methods below are taken from kubernetes repo:
// https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/deployment/util/deployment_util.go

// FindNewReplicaSet returns the new RS this given deployment targets (the one with the same pod template).
func FindNewReplicaSet(deployment *extensions.Deployment, rsList []*extensions.ReplicaSet) (*extensions.ReplicaSet, error) {
	newRSTemplate := GetNewReplicaSetTemplate(deployment)
	for i := range rsList {
		if common.EqualIgnoreHash(rsList[i].Spec.Template, newRSTemplate) {
			// This is the new ReplicaSet.
			return rsList[i], nil
		}
	}
	// new ReplicaSet does not exist.
	return nil, nil
}

// FindOldReplicaSets returns the old replica sets targeted by the given Deployment, with the given slice of RSes.
// Note that the first set of old replica sets doesn't include the ones with no pods, and the second set of old replica sets include all old replica sets.
func FindOldReplicaSets(deployment *extensions.Deployment, rsList []*extensions.ReplicaSet) ([]*extensions.ReplicaSet, []*extensions.ReplicaSet, error) {
	var requiredRSs []*extensions.ReplicaSet
	var allRSs []*extensions.ReplicaSet
	newRS, err := FindNewReplicaSet(deployment, rsList)
	if err != nil {
		return nil, nil, err
	}
	for _, rs := range rsList {
		// Filter out new replica set
		if newRS != nil && rs.UID == newRS.UID {
			continue
		}
		allRSs = append(allRSs, rs)
		if *(rs.Spec.Replicas) != 0 {
			requiredRSs = append(requiredRSs, rs)
		}
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
