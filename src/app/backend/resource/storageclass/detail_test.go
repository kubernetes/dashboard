package storageclass

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	storage "k8s.io/api/storage/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestToStorageClass(t *testing.T) {
	cases := []struct {
		storage  *storage.StorageClass
		expected StorageClass
	}{
		{
			storage: &storage.StorageClass{},
			expected: StorageClass{
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindStorageClass},
			},
		}, {
			storage: &storage.StorageClass{
				ObjectMeta: metaV1.ObjectMeta{Name: "test-storage"}},
			expected: StorageClass{
				ObjectMeta: api.ObjectMeta{Name: "test-storage"},
				TypeMeta:   api.TypeMeta{Kind: api.ResourceKindStorageClass},
			},
		},
	}

	for _, c := range cases {
		actual := toStorageClass(c.storage)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toStorageClass(%#v) == \ngot %#v, \nexpected %#v", c.storage, actual, c.expected)
		}
	}
}
