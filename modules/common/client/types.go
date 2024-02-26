package client

import (
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/apimachinery/pkg/runtime"
)

const (
	// DefaultQPS is the default globalClient QPS configuration. High enough QPS to fit all expected use cases.
	// QPS=0 is not set here, because globalClient code is overriding it.
	DefaultQPS = 1e6
	// DefaultBurst is the default globalClient burst configuration. High enough Burst to fit all expected use cases.
	// Burst=0 is not set here, because globalClient code is overriding it.
	DefaultBurst = 1e6
	// DefaultContentType is the default kubernetes protobuf content type
	DefaultContentType = "application/vnd.kubernetes.protobuf"
	// DefaultCmdConfigName is the default cluster/context/auth name to be set in clientcmd config
	DefaultCmdConfigName = "kubernetes"
	// DefaultUserAgent is the default http header for user-agent
	DefaultUserAgent = "dashboard"
	// ImpersonateUserHeader is the header name to identify username to act as.
	ImpersonateUserHeader = "Impersonate-User"
	// ImpersonateGroupHeader is the header name to identify group name to act as.
	// Can be provided multiple times to set multiple groups.
	ImpersonateGroupHeader = "Impersonate-Group"
	// ImpersonateUserExtraHeader is the header name used to associate extra fields with the user.
	// It is optional, and it requires ImpersonateUserHeader to be set.
	ImpersonateUserExtraHeader = "Impersonate-Extra-"
)

// ResourceVerber is responsible for performing generic CRUD operations on all supported resources.
type ResourceVerber interface {
	Put(kind string, namespaceSet bool, namespace string, name string,
		object *runtime.Unknown) error
	Get(kind string, namespaceSet bool, namespace string, name string) (runtime.Object, error)
	Delete(kind string, namespaceSet bool, namespace string, name string, deleteNow bool) error
}

// ResourceKind is an unique name for each resource. It can used for API discovery and generic
// code that does things based on the kind. For example, there may be a generic "deleter"
// that based on resource kind, name and namespace deletes it.
type ResourceKind string

// List of all resource kinds supported by the UI.
const (
	ResourceKindConfigMap                = "configmap"
	ResourceKindDaemonSet                = "daemonset"
	ResourceKindDeployment               = "deployment"
	ResourceKindEvent                    = "event"
	ResourceKindHorizontalPodAutoscaler  = "horizontalpodautoscaler"
	ResourceKindIngress                  = "ingress"
	ResourceKindServiceAccount           = "serviceaccount"
	ResourceKindJob                      = "job"
	ResourceKindCronJob                  = "cronjob"
	ResourceKindLimitRange               = "limitrange"
	ResourceKindNamespace                = "namespace"
	ResourceKindNode                     = "node"
	ResourceKindPersistentVolumeClaim    = "persistentvolumeclaim"
	ResourceKindPersistentVolume         = "persistentvolume"
	ResourceKindCustomResourceDefinition = "customresourcedefinition"
	ResourceKindPod                      = "pod"
	ResourceKindReplicaSet               = "replicaset"
	ResourceKindReplicationController    = "replicationcontroller"
	ResourceKindResourceQuota            = "resourcequota"
	ResourceKindSecret                   = "secret"
	ResourceKindService                  = "service"
	ResourceKindStatefulSet              = "statefulset"
	ResourceKindStorageClass             = "storageclass"
	ResourceKindClusterRole              = "clusterrole"
	ResourceKindClusterRoleBinding       = "clusterrolebinding"
	ResourceKindRole                     = "role"
	ResourceKindRoleBinding              = "rolebinding"
	ResourceKindEndpoint                 = "endpoint"
	ResourceKindNetworkPolicy            = "networkpolicy"
	ResourceKindIngressClass             = "ingressclass"
)

// Scalable method return whether ResourceKind is scalable.
func (k ResourceKind) Scalable() bool {
	scalable := []ResourceKind{
		ResourceKindDeployment,
		ResourceKindReplicaSet,
		ResourceKindReplicationController,
		ResourceKindStatefulSet,
	}

	for _, kind := range scalable {
		if k == kind {
			return true
		}
	}

	return false
}

// Restartable method return whether ResourceKind is restartable.
func (k ResourceKind) Restartable() bool {
	restartable := []ResourceKind{
		ResourceKindDeployment,
	}

	for _, kind := range restartable {
		if k == kind {
			return true
		}
	}

	return false
}

// ClientType represents type of client that is used to perform generic operations on resources.
// Different resources belong to different client, i.e. Deployments belongs to extension client
// and StatefulSets to apps client.
type ClientType string

// List of client types supported by the UI.
const (
	ClientTypeDefault             = "restclient"
	ClientTypeAppsClient          = "appsclient"
	ClientTypeBatchClient         = "batchclient"
	ClientTypeAutoscalingClient   = "autoscalingclient"
	ClientTypeStorageClient       = "storageclient"
	ClientTypeRbacClient          = "rbacclient"
	ClientTypeAPIExtensionsClient = "apiextensionsclient"
	ClientTypeNetworkingClient    = "networkingclient"
)

// APIMapping is the mapping from resource kind to ClientType and Namespaced.
type APIMapping struct {
	// Kubernetes resource name.
	Resource string
	// Client type used by given resource, i.e. deployments are using extension client.
	ClientType ClientType
	// Is this object global scoped (not below a namespace).
	Namespaced bool
}

// KindToAPIMapping is the mapping from resource kind to K8s apiserver API path. This is mostly pluralization, because
// Kubernetes apiserver uses plural paths and this project singular.
// Must be kept in sync with the list of supported kinds.
// See: https://kubernetes.io/docs/reference/
var KindToAPIMapping = map[string]APIMapping{
	ResourceKindConfigMap:                {"configmaps", ClientTypeDefault, true},
	ResourceKindDaemonSet:                {"daemonsets", ClientTypeAppsClient, true},
	ResourceKindDeployment:               {"deployments", ClientTypeAppsClient, true},
	ResourceKindEvent:                    {"events", ClientTypeDefault, true},
	ResourceKindHorizontalPodAutoscaler:  {"horizontalpodautoscalers", ClientTypeAutoscalingClient, true},
	ResourceKindIngress:                  {"ingresses", ClientTypeNetworkingClient, true},
	ResourceKindIngressClass:             {"ingressclasses", ClientTypeNetworkingClient, false},
	ResourceKindJob:                      {"jobs", ClientTypeBatchClient, true},
	ResourceKindCronJob:                  {"cronjobs", ClientTypeBatchClient, true},
	ResourceKindLimitRange:               {"limitrange", ClientTypeDefault, true},
	ResourceKindNamespace:                {"namespaces", ClientTypeDefault, false},
	ResourceKindNode:                     {"nodes", ClientTypeDefault, false},
	ResourceKindPersistentVolumeClaim:    {"persistentvolumeclaims", ClientTypeDefault, true},
	ResourceKindPersistentVolume:         {"persistentvolumes", ClientTypeDefault, false},
	ResourceKindCustomResourceDefinition: {"customresourcedefinitions", ClientTypeAPIExtensionsClient, false},
	ResourceKindPod:                      {"pods", ClientTypeDefault, true},
	ResourceKindReplicaSet:               {"replicasets", ClientTypeAppsClient, true},
	ResourceKindReplicationController:    {"replicationcontrollers", ClientTypeDefault, true},
	ResourceKindResourceQuota:            {"resourcequotas", ClientTypeDefault, true},
	ResourceKindSecret:                   {"secrets", ClientTypeDefault, true},
	ResourceKindService:                  {"services", ClientTypeDefault, true},
	ResourceKindServiceAccount:           {"serviceaccounts", ClientTypeDefault, true},
	ResourceKindStatefulSet:              {"statefulsets", ClientTypeAppsClient, true},
	ResourceKindStorageClass:             {"storageclasses", ClientTypeStorageClient, false},
	ResourceKindEndpoint:                 {"endpoints", ClientTypeDefault, true},
	ResourceKindNetworkPolicy:            {"networkpolicies", ClientTypeNetworkingClient, true},
	ResourceKindClusterRole:              {"clusterroles", ClientTypeRbacClient, false},
	ResourceKindClusterRoleBinding:       {"clusterrolebindings", ClientTypeRbacClient, false},
	ResourceKindRole:                     {"roles", ClientTypeRbacClient, true},
	ResourceKindRoleBinding:              {"rolebindings", ClientTypeRbacClient, true},
}

// IsSelectorMatching returns true when an object with the given selector targets the same
// Resources (or subset) that the target object with the given selector.
func IsSelectorMatching(srcSelector map[string]string, targetObjectLabels map[string]string) bool {
	// If service has no selectors, then assume it targets different resource.
	if len(srcSelector) == 0 {
		return false
	}
	for label, value := range srcSelector {
		if rsValue, ok := targetObjectLabels[label]; !ok || rsValue != value {
			return false
		}
	}
	return true
}

// IsLabelSelectorMatching returns true when a resource with the given selector targets the same
// Resources(or subset) that a target object selector with the given selector.
func IsLabelSelectorMatching(srcSelector map[string]string, targetLabelSelector *metaV1.LabelSelector) bool {
	// Check to see if targetLabelSelector pointer is not nil.
	if targetLabelSelector != nil {
		targetObjectLabels := targetLabelSelector.MatchLabels
		return IsSelectorMatching(srcSelector, targetObjectLabels)
	}
	return false
}

// ListEverything is a list options used to list all resources without any filtering.
var ListEverything = metaV1.ListOptions{
	LabelSelector: labels.Everything().String(),
	FieldSelector: fields.Everything().String(),
}
