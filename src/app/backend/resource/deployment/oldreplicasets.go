package deployment

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

//GetDeploymentEvents returns model events for a deployment with the given name in the given
//namespace
func GetDeploymentOldReplicaSets(client client.Interface, dsQuery *dataselect.DataSelectQuery,
	namespace string, deploymentName string) (*replicaset.ReplicaSetList, error) {

	deployment, err := client.Extensions().Deployments(namespace).Get(deploymentName,
		metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	selector, err := metaV1.LabelSelectorAsSelector(deployment.Spec.Selector)
	if err != nil {
		return nil, err
	}
	options := metaV1.ListOptions{LabelSelector: selector.String()}

	channels := &common.ResourceChannels{
		ReplicaSetList: common.GetReplicaSetListChannelWithOptions(client,
			common.NewSameNamespaceQuery(namespace), options, 1),
		PodList: common.GetPodListChannelWithOptions(client,
			common.NewSameNamespaceQuery(namespace), options, 1),
		EventList: common.GetEventListChannelWithOptions(client,
			common.NewSameNamespaceQuery(namespace), options, 1),
	}

	rawRs := <-channels.ReplicaSetList.List
	if err := <-channels.ReplicaSetList.Error; err != nil {
		return nil, err
	}
	rawPods := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}
	rawEvents := <-channels.EventList.List
	if err := <-channels.EventList.Error; err != nil {
		return nil, err
	}

	rawRepSets := make([]*extensions.ReplicaSet, 0)
	for i := range rawRs.Items {
		rawRepSets = append(rawRepSets, &rawRs.Items[i])
	}
	oldRs, _, err := FindOldReplicaSets(deployment, rawRepSets, rawPods)
	if err != nil {
		return nil, err
	}

	oldReplicaSets := make([]extensions.ReplicaSet, len(oldRs))
	for i, replicaSet := range oldRs {
		oldReplicaSets[i] = *replicaSet
	}
	oldReplicaSetList := replicaset.CreateReplicaSetList(oldReplicaSets, rawPods.Items,
		rawEvents.Items, dsQuery, nil)
	return oldReplicaSetList, nil
}
