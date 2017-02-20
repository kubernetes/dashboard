package metric

import (
	"encoding/json"
	"fmt"
	"log"
	"reflect"
	"regexp"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	heapster "k8s.io/heapster/metrics/api/v1/types"
)

type GlobalCounter int32

func (c *GlobalCounter) increment() int32 {
	return atomic.AddInt32((*int32)(c), 1)
}

func (c *GlobalCounter) get() int32 {
	return atomic.LoadInt32((*int32)(c))
}

func (c *GlobalCounter) set(val int32) {
	atomic.StoreInt32((*int32)(c), val)
}

var _NumRequests = GlobalCounter(0)

type FakeHeapster struct {
	PodData
	NodeData
	numRequests int
}

type FakeRequest struct {
	PodData
	NodeData
	Path string
}

type PodData map[string][]heapster.MetricPoint
type NodeData map[string][]heapster.MetricPoint

func (self FakeHeapster) Get(path string) client.RequestInterface {
	return FakeRequest{self.PodData, self.NodeData, path}
}

func (self FakeHeapster) GetNumberOfRequestsMade() int {
	num := int(_NumRequests.get())
	_NumRequests.set(0)
	return num
}

func (self FakeRequest) DoRaw() ([]byte, error) {
	_NumRequests.increment()
	log.Println("Performing req...")
	path := self.Path
	time.Sleep(50 * time.Millisecond) // simulate response delay of 0.05 seconds
	if strings.Contains(path, "/pod-list/") {
		r, _ := regexp.Compile(`\/pod\-list\/(.+)\/metrics\/`)
		submatch := r.FindStringSubmatch(path)
		if len(submatch) != 2 {
			return nil, fmt.Errorf("Invalid request url %s", path)
		}
		requestedPods := strings.Split(submatch[1], ",")

		r, _ = regexp.Compile(`\/namespaces\/(.+)\/pod\-list\/`)
		submatch = r.FindStringSubmatch(path)
		if len(submatch) != 2 {
			return nil, fmt.Errorf("Invalid request url %s", path)
		}
		namespace := submatch[1]

		items := []heapster.MetricResult{}
		for _, pod := range requestedPods {
			items = append(items, heapster.MetricResult{Metrics: self.PodData[pod+"/"+namespace]})
		}
		x, err := json.Marshal(heapster.MetricResultList{Items: items})
		log.Println("Got you:", string(x))
		return x, err

	} else if strings.Contains(path, "/nodes/") {
		r, _ := regexp.Compile(`\/nodes\/(.+)\/metrics\/`)
		submatch := r.FindStringSubmatch(path)
		if len(submatch) != 2 {
			return nil, fmt.Errorf("Invalid request url %s", path)
		}
		requestedNode := submatch[1]

		x, err := json.Marshal(heapster.MetricResult{Metrics: self.NodeData[requestedNode]})
		log.Println("Got you:", string(x))
		return x, err
	} else {
		return nil, fmt.Errorf("Invalid request url %s", path)
	}
}

const TimeTemplate = "2016-08-12T11:0%d:00Z"
const TimeTemplateValue = int64(1470999600)

func NewRawDPs(dps []int64, startTime int) []heapster.MetricPoint {
	newRdps := []heapster.MetricPoint{}
	for i := 0; i < len(dps) && startTime+i < 10; i++ {
		parsedTime, _ := time.Parse(time.RFC3339, fmt.Sprintf(TimeTemplate, i+startTime))
		newRdps = append(newRdps, heapster.MetricPoint{Timestamp: parsedTime, Value: uint64(dps[i])})
	}
	return newRdps
}

func newDps(dps []int64, startTime int) DataPoints {
	newDps := DataPoints{}
	for i := 0; i < len(dps) && startTime+i < 10; i++ {
		newDps = append(newDps, DataPoint{TimeTemplateValue + int64(60*(i+startTime)), dps[i]})
	}
	return newDps
}

var fakePodData = PodData{
	"P1/a": NewRawDPs([]int64{0, 5, 10}, 0),
	"P2/a": NewRawDPs([]int64{15, 20, 25}, 0),
	"P3/a": NewRawDPs([]int64{30, 35, 40}, 0),
	"P4/a": NewRawDPs([]int64{45, 50, -100000}, 0),
	"P1/b": NewRawDPs([]int64{1000, 1100}, 0),
	"P2/b": NewRawDPs([]int64{1200, 1300}, 1),
	"P3/b": NewRawDPs([]int64{1400, 1500}, 2),
	"P4/b": NewRawDPs([]int64{}, 0),
	"P1/c": NewRawDPs([]int64{10000, 11000, 12000}, 0),
	"P2/c": NewRawDPs([]int64{13000, 14000, 15000}, 0),
}

var fakeNodeData = NodeData{
	"N1": NewRawDPs([]int64{0, 5, 10}, 0),
	"N2": NewRawDPs([]int64{15, 20, 25}, 0),
	"N3": NewRawDPs([]int64{30, 35, 40}, 0),
	"N4": NewRawDPs([]int64{45, 50, 55}, 0),
}

var fakeHeapsterClient = FakeHeapster{
	PodData:  fakePodData,
	NodeData: fakeNodeData,
}

func fakeHeapsterSelector(resourceType common.ResourceKind, namespace string, resourceNames []string) HeapsterSelector {
	a, _ := NewHeapsterSelectorFromNativeResource(resourceType, namespace, resourceNames)
	return a
}

func TestHeapsterSelector(t *testing.T) {
	type HeapsterSelectorTestCase struct {
		Info                string
		Selector            HeapsterSelector
		ExpectedDataPoints  DataPoints
		ExpectedNumRequests int
	}
	testCases := []HeapsterSelectorTestCase{
		{
			"get data for single pod",
			fakeHeapsterSelector(common.ResourceKindPod, "a", []string{"P1"}),
			newDps([]int64{0, 5, 10}, 0),
			1,
		},
		{
			"get data for 3 pods",
			fakeHeapsterSelector(common.ResourceKindPod, "a", []string{"P1", "P2", "P3"}),
			newDps([]int64{45, 60, 75}, 0),
			1,
		},
		{
			"get data for 4 pods where 1 pod does not exist - ignore non existing pod",
			fakeHeapsterSelector(common.ResourceKindPod, "a", []string{"P1", "P2", "P3", "NON_EXISTING"}),
			newDps([]int64{45, 60, 75}, 0),
			1,
		},
		{
			"get data for 4 pods where pods have different X timestams available",
			fakeHeapsterSelector(common.ResourceKindPod, "b", []string{"P1", "P2", "P3", "P4"}),
			newDps([]int64{1000, 2300, 2700, 1500}, 0),
			1,
		},
		{
			"ask for non existing namespace - return no data points",
			fakeHeapsterSelector(common.ResourceKindPod, "NON_EXISTING_NAMESPACE", []string{"P1"}),
			newDps([]int64{}, 0),
			1,
		},
		{
			"get data for 0 pods - return no data points",
			fakeHeapsterSelector(common.ResourceKindPod, "b", []string{}),
			newDps([]int64{}, 0),
			0,
		},
		{
			"get data for 0 nodes - return no data points",
			fakeHeapsterSelector(common.ResourceKindNode, "NO_NAMESPACE", []string{}),
			newDps([]int64{}, 0),
			0,
		},
		{
			"ask for 1 node",
			fakeHeapsterSelector(common.ResourceKindNode, "NO_NAMESPACE", []string{"N1"}),
			newDps([]int64{0, 5, 10}, 0),
			1,
		},
		{
			"ask for 3 nodes",
			fakeHeapsterSelector(common.ResourceKindNode, "NO_NAMESPACE", []string{"N1", "N2", "N3"}),
			newDps([]int64{45, 60, 75}, 0),
			3, // change this to 1 when nodes support all in 1 download.
		},
	}
	for _, testCase := range testCases {
		log.Println("-----------\n\n\n", testCase.Info, int(_NumRequests.get()))
		metric, err := testCase.Selector.DownloadMetric(fakeHeapsterClient, "").GetMetric()
		num_req := fakeHeapsterClient.GetNumberOfRequestsMade()
		if err != nil {
			t.Errorf("Test Case: %s. Failed to get metrics - %s", testCase.Info, err)
			return
		}

		if !reflect.DeepEqual(metric.DataPoints, testCase.ExpectedDataPoints) {
			t.Errorf("Test Case: %s. Received incorrect data points. Got %v, expected %v.",
				testCase.Info, metric.DataPoints, testCase.ExpectedDataPoints)
		}

		if testCase.ExpectedNumRequests != num_req {
			t.Errorf("Test Case: %s. Selector performed unexpected number of requests to the heapster server. Performed %d, expected %d",
				testCase.Info, num_req, testCase.ExpectedNumRequests)
		}
	}
}

var selectorPool = HeapsterSelectors{
	fakeHeapsterSelector(common.ResourceKindPod, "a", []string{"P1"}),
	fakeHeapsterSelector(common.ResourceKindPod, "a", []string{"P2", "P3", "P4"}),
	fakeHeapsterSelector(common.ResourceKindPod, "a", []string{"P3", "P4"}),
	fakeHeapsterSelector(common.ResourceKindPod, "b", []string{"P1", "P2", "P3"}),
	fakeHeapsterSelector(common.ResourceKindPod, "b", []string{"P2", "P3", "P4"}),
	fakeHeapsterSelector(common.ResourceKindNode, "NO_NAMESPACE", []string{"N1", "N2", "N3"}),
	fakeHeapsterSelector(common.ResourceKindNode, "NO_NAMESPACE", []string{"N3", "N4"}),
}

func TestHeapsterSelectors(t *testing.T) {
	type HeapsterSelectorsTestCase struct {
		Info                string
		SelectorIds         []int
		AggregationNames    AggregationNames
		MetricNames         []string
		ExpectedDataPoints  []DataPoints
		ExpectedNumRequests int
	}

	MinMaxSumAggregations := AggregationNames{MinAggregation, MaxAggregation, SumAggregation}
	testCases := []HeapsterSelectorsTestCase{
		{
			"ask for 1 resource",
			[]int{1},
			MinMaxSumAggregations,
			[]string{"Dummy/Metric"},
			[]DataPoints{
				newDps([]int64{90, 105, 65}, 0),
				newDps([]int64{90, 105, 65}, 0),
				newDps([]int64{90, 105, 65}, 0),
			},
			1,
		},
		{
			"ask for 2 resources from same namespace",
			[]int{0, 1},
			MinMaxSumAggregations,
			[]string{"Dummy/Metric"},
			[]DataPoints{
				newDps([]int64{0, 5, 10}, 0),
				newDps([]int64{90, 105, 65}, 0),
				newDps([]int64{90, 110, 75}, 0),
			},
			1,
		},
		{
			"ask for 3 resources from same namespace, get 2 metrics",
			[]int{0, 1, 2},
			MinMaxSumAggregations,
			[]string{"Dummy/Metric1", "DummyMetric2"},
			[]DataPoints{
				newDps([]int64{0, 5, 10}, 0),
				newDps([]int64{90, 105, 65}, 0),
				newDps([]int64{165, 195, 115}, 0),
				newDps([]int64{0, 5, 10}, 0),
				newDps([]int64{90, 105, 65}, 0),
				newDps([]int64{165, 195, 115}, 0),
			},
			2,
		},
		{
			"ask for multiple resources of the same kind from multiple namespaces",
			[]int{0, 1, 2, 3, 4},
			MinMaxSumAggregations,
			[]string{"Dummy/Metric"},
			[]DataPoints{
				newDps([]int64{0, 5, 10, 1500}, 0),
				newDps([]int64{1000, 2300, 2700, 1500}, 0),
				newDps([]int64{1165, 3695, 5515, 3000}, 0),
			},
			2,
		},
		{
			"ask for multiple resources of different kind from multiple namespaces",
			[]int{0, 1, 2, 3, 4, 5, 6},
			MinMaxSumAggregations,
			[]string{"Dummy/Metric"},
			[]DataPoints{
				newDps([]int64{0, 5, 10, 1500}, 0),
				newDps([]int64{1000, 2300, 2700, 1500}, 0),
				newDps([]int64{1285, 3840, 5685, 3000}, 0),
			},
			6, // if we had node-list option in heapster API we would make only 3 requests
			// unfortunately there is no such option and we have to make one request per node
			// note that nodes overlap (1,2,3) + (3,4) and we download node 3 only once thanks to request compression
			// So 4 requests for nodes (one for each unique node) and 2 requests for pods (1 for each  namespace) = 6 in total.
		},
	}

	for _, testCase := range testCases {
		selectors := HeapsterSelectors{}
		for _, selectorId := range testCase.SelectorIds {
			selectors = append(selectors, selectorPool[selectorId])
		}

		metrics, err := selectors.DownloadAndAggregate(fakeHeapsterClient, testCase.MetricNames, testCase.AggregationNames).GetMetrics()
		if err != nil {
			t.Errorf("Test Case: %s. Failed to get metrics - %s", testCase.Info, err)
			return
		}
		receivedDataPoints := []DataPoints{}
		for _, metric := range metrics {
			receivedDataPoints = append(receivedDataPoints, metric.DataPoints)
		}

		if !reflect.DeepEqual(receivedDataPoints, testCase.ExpectedDataPoints) {
			t.Errorf("Test Case: %s. Received incorrect data points. Got %v, expected %v.",
				testCase.Info, receivedDataPoints, testCase.ExpectedDataPoints)
		}
		num_req := fakeHeapsterClient.GetNumberOfRequestsMade()
		if testCase.ExpectedNumRequests != num_req {
			t.Errorf("Test Case: %s. Selector performed unexpected number of requests to the heapster server. Performed %d, expected %d",
				testCase.Info, num_req, testCase.ExpectedNumRequests)
		}
	}
}
