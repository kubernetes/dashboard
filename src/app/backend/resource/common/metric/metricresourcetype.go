package metric

type MetricResourceType string

// List of all resource Types that support metric download.
const (
	ResourceTypeReplicaSet            = "replicasets"
	ResourceTypeService               = "services"
	ResourceTypeDeployment            = "deployments"
	ResourceTypePod                   = "pods"
	ResourceTypeReplicationController = "replicationcontrollers"
	ResourceTypeDaemonSet             = "daemonsets"
	ResourceTypePetSet                = "petsets"
	ResourceTypeNode                  = "nodes"
)


var DerivedResources = map[MetricResourceType]MetricResourceType{
	ResourceTypeReplicaSet:            ResourceTypePod,
	ResourceTypeService:               ResourceTypePod,
	ResourceTypeDeployment:            ResourceTypePod,
	ResourceTypeReplicationController: ResourceTypePod,
	ResourceTypeDaemonSet:             ResourceTypePod,
	ResourceTypePetSet:                ResourceTypePod,

}
