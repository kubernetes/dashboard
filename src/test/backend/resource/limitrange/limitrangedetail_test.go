package limitrange

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/resource"
)

func TestGetLimitResourceDetail(t *testing.T) {
	testMemory := "6G"
	testCpu := "500m"
	testMemoryQuantity, _ := resource.ParseQuantity(testMemory)
	testCpuQuantity, _ := resource.ParseQuantity(testCpu)
	cases := []struct {
		limitRanges *api.LimitRange
		expected    *LimitRangeDetail
	}{
		{
			&api.LimitRange{
				ObjectMeta: api.ObjectMeta{Name: "foo"},
				Spec: api.LimitRangeSpec{
					Limits: []api.LimitRangeItem{
						{
							Type: api.LimitTypePod,
							Max: map[api.ResourceName]resource.Quantity{
								api.ResourceMemory: testMemoryQuantity,
								api.ResourceCPU:    testCpuQuantity,
							},
							Min: map[api.ResourceName]resource.Quantity{
								api.ResourceMemory: testMemoryQuantity,
								api.ResourceCPU:    testCpuQuantity,
							},
							Default: map[api.ResourceName]resource.Quantity{
								api.ResourceMemory: testMemoryQuantity,
								api.ResourceCPU:    testCpuQuantity,
							},
							DefaultRequest: map[api.ResourceName]resource.Quantity{
								api.ResourceMemory: testMemoryQuantity,
								api.ResourceCPU:    testCpuQuantity,
							},
							MaxLimitRequestRatio: map[api.ResourceName]resource.Quantity{
								api.ResourceMemory: testMemoryQuantity,
								api.ResourceCPU:    testCpuQuantity,
							},
						},
					},
				},
			},
			&LimitRangeDetail{
				ObjectMeta: common.ObjectMeta{Name: "foo"},
				TypeMeta:   common.TypeMeta{Kind: "limitrange"},
				LimitRanges: []LimitRangeItem{
					LimitRangeItem{
						ResourceType:         string(api.LimitTypePod),
						ResourceName:         string(api.ResourceCPU),
						Max:                  testCpu,
						Min:                  testCpu,
						Default:              testCpu,
						DefaultRequest:       testCpu,
						MaxLimitRequestRatio: testCpu,
					},
					LimitRangeItem{
						ResourceType:         string(api.LimitTypePod),
						ResourceName:         string(api.ResourceMemory),
						Max:                  testMemory,
						Min:                  testMemory,
						Default:              testMemory,
						DefaultRequest:       testMemory,
						MaxLimitRequestRatio: testMemory,
					},
				},
			},
		},
	}

	for _, c := range cases {
		actual := getLimitRangeDetail(c.limitRanges)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getLimitRangeDetail(%#v) == \n%#v\nexpected \n%#v\n",
				c.limitRanges, actual, c.expected)
		}
	}
}
