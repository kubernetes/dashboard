package deployment

import (
	"log"

	"github.com/kubernetes/dashboard/resource/common"

	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

type RollingUpdateStrategy struct {
	MaxSurge       int `json:"maxSurge"`
	MaxUnavailable int `json:"maxUnavailable"`
}

// ReplicaSetDetail is a presentation layer view of Kubernetes Replica Set resource. This means
type DeploymentDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Label selector of the service.
	Selector map[string]string `json:"selector"`

	// Status
	Status extensions.DeploymentStatus `json:"status"`

	// The deployment strategy to use to replace existing pods with new ones.  Valid options: Recreate, RollingUpdate
	Strategy string `json:"strategy"`

	// Min ready seconds
	MinReadySeconds int `json:"minReadySeconds"`

	// Rolling update strategy
	//	1 max unavailable, 1 max surge
	RollingUpdateStrategy `json:"rollingUpdateStrategy,omitempty"`

	//OldReplicaSets

	//NewReplicaSet

	//Events
}

func GetDeploymentDetail(client client.Interface, namespace string, name string) (*DeploymentDetail, error) {

	log.Printf("Getting details of %s deployment in %s namespace", name, namespace)

	deploymentData, err := client.Extensions().Deployments(namespace).Get(name)
	if err != nil {
		return nil, err
	}

	return getDeploymentDetail(deploymentData), nil
}

func getDeploymentDetail(deployment *extensions.Deployment) *DeploymentDetail {

	return &DeploymentDetail{
		ObjectMeta:      common.NewObjectMeta(deployment.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindDeployment),
		Selector:        deployment.Spec.Selector.MatchLabels,
		Status:          deployment.Status,
		Strategy:        string(deployment.Spec.Strategy.Type),
		MinReadySeconds: deployment.Spec.MinReadySeconds,
		RollingUpdateStrategy: RollingUpdateStrategy{
			MaxSurge:       deployment.Spec.Strategy.RollingUpdate.MaxSurge.IntValue(),
			MaxUnavailable: deployment.Spec.Strategy.RollingUpdate.MaxUnavailable.IntValue(),
		},
	}
}
