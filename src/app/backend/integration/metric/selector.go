package metric

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/apimachinery/pkg/types"
)

// DerivedResources is a map from a derived resource(a resource that is not supported by heapster)
// to native resource (supported by heapster) to which derived resource should be converted.
// For example, deployment is not available in heapster so it has to be converted to its pods before downloading any data.
// Hence deployments map to pods.
var DerivedResources = map[common.ResourceKind]common.ResourceKind{
	common.ResourceKindDeployment:            common.ResourceKindPod,
	common.ResourceKindReplicaSet:            common.ResourceKindPod,
	common.ResourceKindReplicationController: common.ResourceKindPod,
	common.ResourceKindDaemonSet:             common.ResourceKindPod,
	common.ResourceKindStatefulSet:           common.ResourceKindPod,
	common.ResourceKindJob:                   common.ResourceKindPod,
}

// ResourceSelector is a structure used to quickly and uniquely identify given resource.
// This struct can be later used for heapster data download etc.
type ResourceSelector struct {
	// Namespace of this resource.
	Namespace string
	// Type of this resource
	ResourceType common.ResourceKind
	// Name of this resource.
	ResourceName string
	// Selector used to identify this resource (should be used only for Deployments!).
	Selector map[string]string
	// UID is resource unique identifier.
	UID types.UID
}
