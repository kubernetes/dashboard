package persistentvolumeclaim


import (
	"log"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"fmt"

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
	log.Printf("Getting list persistent volume claims")
	list, _ := client.PersistentVolumeClaims(nsQuery.ToRequestParam()).List(listEverything)
	fmt.Println(list)

	result := &PersistentVolumeClaimList{
		ListMeta: common.ListMeta{
			TotalItems: len(list.Items),
		},
		Items: make([]PersistentVolumeClaim,0),
	}

	for _, item := range list.Items {
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