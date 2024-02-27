package types

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

// kindToAPIMapping is the mapping from resource kind to K8s apiserver API path. This is mostly pluralization, because
// Kubernetes apiserver uses plural paths and this project singular.
// Must be kept in sync with the list of supported kinds.
// See: https://kubernetes.io/docs/reference/
var kindToAPIMapping = map[ResourceKind]APIMapping{
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

func APIMappingByKind(kind ResourceKind) (apiMapping APIMapping, exists bool) {
	apiMapping, exists = kindToAPIMapping[kind]
	return
}
