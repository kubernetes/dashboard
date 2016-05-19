package deployment

import (
	"log"

	"github.com/kubernetes/dashboard/resource/common"
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	deploymentutil "k8s.io/kubernetes/pkg/util/deployment"
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

	// Rolling update strategy containing maxSurge and maxUnavailable
	RollingUpdateStrategy `json:"rollingUpdateStrategy,omitempty"`

	// OldReplicaSets
	OldReplicaSets []extensions.ReplicaSet `json:"oldReplicaSets"`

	// New replica set used by this deployment
	NewReplicaSet extensions.ReplicaSet `json:"newReplicaSet"`

	// List of events related to this Deployment
	EventList common.EventList `json:"eventList"`
}

func GetDeploymentDetail(client client.Interface, namespace string, name string) (*DeploymentDetail, error) {

	log.Printf("Getting details of %s deployment in %s namespace", name, namespace)

	deploymentData, err := client.Extensions().Deployments(namespace).Get(name)
	if err != nil {
		return nil, err
	}

	channels := &common.ResourceChannels{
		ReplicaSetList: common.GetReplicaSetListChannel(client.Extensions(), 1),
		PodList:        common.GetPodListChannel(client, 1),
	}

	replicaSetList := <-channels.ReplicaSetList.List
	if err := <-channels.ReplicaSetList.Error; err != nil {
		return nil, err
	}

	pods := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	oldReplicaSets, _, err := deploymentutil.FindOldReplicaSets(deploymentData, replicaSetList.Items, pods)
	if err != nil {
		return nil, err
	}

	newReplicaSet, err := deploymentutil.FindNewReplicaSet(deploymentData, replicaSetList.Items)
	if err != nil {
		return nil, err
	}

	events, err := GetDeploymentEvents(client, namespace, name)
	if err != nil {
		return nil, err
	}

	return getDeploymentDetail(deploymentData, oldReplicaSets, newReplicaSet, events), nil
}

func getDeploymentDetail(deployment *extensions.Deployment, old []*extensions.ReplicaSet, newReplicaSet *extensions.ReplicaSet, events *common.EventList) *DeploymentDetail {

	oldReplicaSets := make([]extensions.ReplicaSet, len(old))
	for i, replicaSet := range old {
		oldReplicaSets[i] = *replicaSet
	}

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
		OldReplicaSets: oldReplicaSets,
		NewReplicaSet:  *newReplicaSet,
		EventList:      *events,
	}
}
