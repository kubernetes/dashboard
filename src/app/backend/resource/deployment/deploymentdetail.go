package deployment

import (
	"log"

	"github.com/kubernetes/dashboard/resource/common"
	"github.com/kubernetes/dashboard/resource/replicaset"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	deploymentutil "k8s.io/kubernetes/pkg/util/deployment"
)

// RollingUpdateStrategy is behavior of a rolling update. See RollingUpdateDeployment K8s object.
type RollingUpdateStrategy struct {
	MaxSurge       int `json:"maxSurge"`
	MaxUnavailable int `json:"maxUnavailable"`
}

type StatusInfo struct {
	// Total number of desired replicas on the deployment
	Replicas int32 `json:"replicas"`

	// Number of non-terminated pods that have the desired template spec
	Updated int32 `json:"updated"`

	// Number of available pods (ready for at least minReadySeconds)
	// targeted by this deployment
	Available int32 `json:"available"`

	// Total number of unavailable pods targeted by this deployment.
	Unavailable int32 `json:"unavailable"`
}

// DeploymentDetail is a presentation layer view of Kubernetes Deployment resource.
type DeploymentDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Label selector of the service.
	Selector map[string]string `json:"selector"`

	// Status information on the deployment
	StatusInfo `json:"statusInfo"`

	// The deployment strategy to use to replace existing pods with new ones.
	// Valid options: Recreate, RollingUpdate
	Strategy extensions.DeploymentStrategyType `json:"strategy"`

	// Min ready seconds
	MinReadySeconds int32 `json:"minReadySeconds"`

	// Rolling update strategy containing maxSurge and maxUnavailable
	RollingUpdateStrategy `json:"rollingUpdateStrategy,omitempty"`

	// RepliaSetList containing old replica sets from the deployment
	OldReplicaSetList replicaset.ReplicaSetList `json:"oldReplicaSetList"`

	// New replica set used by this deployment
	NewReplicaSet replicaset.ReplicaSet `json:"newReplicaSet"`

	// List of events related to this Deployment
	EventList common.EventList `json:"eventList"`
}

// GetDeploymentDetail returns model object of deployment and error, if any.
func GetDeploymentDetail(client client.Interface, namespace string,
	name string) (*DeploymentDetail, error) {

	log.Printf("Getting details of %s deployment in %s namespace", name, namespace)

	deployment, err := client.Extensions().Deployments(namespace).Get(name)
	if err != nil {
		return nil, err
	}

	selector, err := unversioned.LabelSelectorAsSelector(deployment.Spec.Selector)
	if err != nil {
		return nil, err
	}
	options := api.ListOptions{LabelSelector: selector}
	channels := &common.ResourceChannels{
		ReplicaSetList: common.GetReplicaSetListChannelWithOptions(client.Extensions(),
			common.NewSameNamespaceQuery(namespace), options, 1),
		PodList: common.GetPodListChannelWithOptions(client,
			common.NewSameNamespaceQuery(namespace), options, 1),
	}

	rsList := <-channels.ReplicaSetList.List
	if err := <-channels.ReplicaSetList.Error; err != nil {
		return nil, err
	}

	podList := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	oldReplicaSets, _, err := deploymentutil.FindOldReplicaSets(deployment, rsList.Items, podList)
	if err != nil {
		return nil, err
	}

	newReplicaSet, err := deploymentutil.FindNewReplicaSet(deployment, rsList.Items)
	if err != nil {
		return nil, err
	}

	events, err := GetDeploymentEvents(client, namespace, name)
	if err != nil {
		return nil, err
	}

	return getDeploymentDetail(deployment, oldReplicaSets, newReplicaSet,
		podList.Items, events), nil
}

func getDeploymentDetail(deployment *extensions.Deployment,
	oldRs []*extensions.ReplicaSet, newRs *extensions.ReplicaSet,
	pods []api.Pod, events *common.EventList) *DeploymentDetail {
	var newReplicaSet replicaset.ReplicaSet

	if newRs != nil {
		newRsPodInfo := common.GetPodInfo(newRs.Status.Replicas, newRs.Spec.Replicas, pods)
		newReplicaSet = replicaset.ToReplicaSet(newRs, &newRsPodInfo)
	}

	oldReplicaSets := make([]extensions.ReplicaSet, len(oldRs))
	for i, replicaSet := range oldRs {
		oldReplicaSets[i] = *replicaSet
	}
	oldReplicaSetList := replicaset.ToReplicaSetList(oldReplicaSets,
		[]api.Service{}, pods, []api.Event{}, []api.Node{})

	return &DeploymentDetail{
		ObjectMeta:      common.NewObjectMeta(deployment.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindDeployment),
		Selector:        deployment.Spec.Selector.MatchLabels,
		StatusInfo:      GetStatusInfo(&deployment.Status),
		Strategy:        deployment.Spec.Strategy.Type,
		MinReadySeconds: deployment.Spec.MinReadySeconds,
		RollingUpdateStrategy: RollingUpdateStrategy{
			MaxSurge:       deployment.Spec.Strategy.RollingUpdate.MaxSurge.IntValue(),
			MaxUnavailable: deployment.Spec.Strategy.RollingUpdate.MaxUnavailable.IntValue(),
		},
		OldReplicaSetList: *oldReplicaSetList,
		NewReplicaSet:     newReplicaSet,
		EventList:         *events,
	}
}

func GetStatusInfo(deploymentStatus *extensions.DeploymentStatus) StatusInfo {
	return StatusInfo{
		Replicas:    deploymentStatus.Replicas,
		Updated:     deploymentStatus.UpdatedReplicas,
		Available:   deploymentStatus.AvailableReplicas,
		Unavailable: deploymentStatus.UnavailableReplicas,
	}
}
