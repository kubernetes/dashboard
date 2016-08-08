package persistentvolumeclaim


import (
	"log"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

type PersistentVolumeClaimList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Config Maps
	Items []PersistentVolumeClaim `json:"items"`
}

type PersistentVolumeClaim struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

}

func GetPersistentVolumeClaimList(client *client.Client, nsQuery *common.NamespaceQuery, pQuery *common.PaginationQuery) (*PersistentVolumeClaimList, error) {
	log.Printf("Getting list persistent volumes claims")
	channels := &common.ResourceChannels{
		PersistentVolumeClaimList: common.GetPersistentVolumeClaimListChannel(client,nsQuery, 1),
	}

	return GetPersistentVolumeClaimListFromChannels(channels,nsQuery, pQuery)
}

func GetPersistentVolumeClaimListFromChannels(channels *common.ResourceChannels, nsQuery *common.NamespaceQuery, pQuery *common.PaginationQuery) (
	*PersistentVolumeClaimList, error) {

	persistentVolumeClaims := <-channels.PersistentVolumeClaimList.List
	if err := <-channels.PersistentVolumeClaimList.Error; err != nil {
		return nil, err
	}

	result, err := getPersistentVolumeClaimList(persistentVolumeClaims.Items, nsQuery, pQuery)

	return result, err
}


func getPersistentVolumeClaimList(persistentVolumeClaims []api.PersistentVolumeClaim, nsQuery *common.NamespaceQuery, pQuery *common.PaginationQuery) (*PersistentVolumeClaimList, error) {
	result := &PersistentVolumeClaimList{
		Items:    make([]PersistentVolumeClaim,0),
		ListMeta: common.ListMeta{ TotalItems: len(persistentVolumeClaims),},
	}
	persistentVolumeClaims = paginate(persistentVolumeClaims, pQuery)

	for _, item := range persistentVolumeClaims {
		result.Items = append(result.Items,
			PersistentVolumeClaim{
				ObjectMeta: common.NewObjectMeta(item.ObjectMeta),
				TypeMeta:   common.NewTypeMeta(common.ResourceKindPersistenceVolumeClaim),
			})
	}

	return result, nil
}

var listEverything = api.ListOptions{
	LabelSelector: labels.Everything(),
	FieldSelector: fields.Everything(),
}