package persistentvolumeclaim

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/pkg/api/v1"
)

func TestGetPersistentVolumeClaimList(t *testing.T) {
	cases := []struct {
		persistentVolumeClaims []v1.PersistentVolumeClaim
		expected               *PersistentVolumeClaimList
	}{
		{nil, &PersistentVolumeClaimList{Items: []PersistentVolumeClaim{}}},
		{
			[]v1.PersistentVolumeClaim{{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
				Spec:       v1.PersistentVolumeClaimSpec{VolumeName: "my-volume"},
				Status:     v1.PersistentVolumeClaimStatus{Phase: v1.ClaimBound},
			},
			},
			&PersistentVolumeClaimList{
				ListMeta: api.ListMeta{TotalItems: 1},
				Items: []PersistentVolumeClaim{{
					TypeMeta:   api.TypeMeta{Kind: "persistentvolumeclaim"},
					ObjectMeta: api.ObjectMeta{Name: "foo"},
					Status:     "Bound",
					Volume:     "my-volume",
				}},
			},
		},
	}
	for _, c := range cases {
		actual := getPersistentVolumeClaimList(c.persistentVolumeClaims, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getPersistentVolumeClaimList(%#v) == \n%#v\nexpected \n%#v\n",
				c.persistentVolumeClaims, actual, c.expected)
		}
	}
}
