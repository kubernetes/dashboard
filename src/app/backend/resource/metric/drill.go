// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package metric

import (
	"time"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"errors"
	"encoding/json"
	"strings"
)

type DataList []Data

// Data is a format of data used in this module. This is also the format of data that is being sent by backend API.
type Data struct {
	DataPoints    `json:"dataPoints"`
	Metric    string `json:"metric"`
	// Drill used to download the data
	Drill     `json:"drill"`
	// aggregating function used (if any)
	Aggregate string `json:"aggregate,omitempty"`
}

// DataPromise is used for parallel data extraction. Contains len 1 channels for Data and Error.
type DataPromise struct {
	Data chan *Data
	Error chan error
}

type Metrics []string

type DataPoints []DataPoint

type DataPoint struct {
	X int64 `json:"x"`
	Y int64    `json:"y"`
}

// NativeSelection containing resources natively supported by heapster
// for example {"pods": ["pod1", "pod2", ...], namespaces: ["kube-system"]}
// Check NativeResourceDependencies map to get a full list of supported native resources.
type NativeSelection map[string][]string

func (s *NativeSelection) Copy() (NativeSelection) {
	copy := NativeSelection{}
	for k, v := range *s {
		if v == nil {
			copy[k] = v
			continue
		}
		nv := []string{}
		for _, e := range v {
			nv = append(nv, e)
		}
		copy[k] = nv
	}
	return copy
}

// DerivedSelection containing resources not natively supported by heapster
// for example {"deployments": ["deployment1", "deployment2", ...]}
// Check DerivedResources map to get a full list of supported derived resources.
type DerivedSelection map[string][]string

// NativeResourceDependencies represents heapster data model.
var NativeResourceDependencies = map[string]string{
//	"nodes": "",  // removed nodes as main resource! Now metrics for them will be provided as a sum of metrics from their pods
	"namespaces": "",
	"pods": "namespaces",
	"containers": "pods",
}


// HeapsterJSONFormat represents format of JSON provided by heapster.
type HeapsterJSONFormat struct {
	RawDataPoints []RawDataPoint `json:"metrics"`
}

type RawDataPoint struct {
	Timestamp string `json:"timestamp"`
	Value     int64 `json:"value"`
}


// Drill contains the map of resourceType, resourceName pairs that define the resource for which we should perform heapster operations
// like for example data download, listing all metrics etc. ResourceTypes MUST be in NativeResourceDependencies, otherwise heapster will not understand.
type Drill map[string]string

// ResolveDependency is a general dependency resolution algorithm.
func ResolveDependency(dep string, resolved []string, unresolved []string, depMap map[string]string) ([]string, []string, error) {
	if isInsideArray(dep, resolved) {
		return resolved, unresolved, nil
	}
	// check for circular dep
	if isInsideArray(dep, unresolved) {
		return nil, nil, errors.New("Intrernal Error: circular resource dependency detected")
	}
	if NativeResourceDependencies[dep] != "" {
		unresolved = append(unresolved, dep)
		var err error
		resolved, unresolved, err = ResolveDependency(NativeResourceDependencies[dep], resolved, unresolved, depMap)
		unresolved = unresolved[:len(unresolved) - 1]
		if err != nil {
			return nil, nil, err
		}
	}
	resolved = append(resolved, dep)
	return resolved, unresolved, nil

}

//
// GetResourceResolutionOrder determines resource download order from heapster.
// For example namespace must be selected before pods and pods have to be selected before containers.
// This makes my design very general so in case heapster adds new resources, we will just need to add the dependencies to the
// NativeResourceDependencies map.
func (ds *Drill) GetResourceResolutionOrder() ([]string) {
	resolved := []string{}
	unresolved := []string{}
	for dependency, _ := range *ds {
		var err error
		resolved, unresolved, err = ResolveDependency(dependency, resolved, unresolved, NativeResourceDependencies)
		if err != nil {
			return nil
		}
	}
	return resolved
}

// GetTerminalPath converts this drill to its heapster path.
func (ds *Drill) GetTerminalPath() (string) {
	path := "/model/"
	order := ds.GetResourceResolutionOrder()
	for _, e := range order {
		path += e + "/" + (*ds)[e] + "/"
	}
	return path
}

// GetAvailableMetrics lists all the metrics available for this drill.
func (ds *Drill) GetAvailableMetrics(client client.HeapsterClient) ([]string, error) {
	return heapsterUnmarshalStringList(client, ds.GetTerminalPath() + "metrics/")
}

// GetAvailableResources lists all the resource names available for this drill.
func (ds *Drill) GetAvailableResources(client client.HeapsterClient, resourceName string) ([]string, error) {
	return heapsterUnmarshalStringList(client, ds.GetTerminalPath() + resourceName + "/")
}

// DownloadMetric downloads one metric for this drill from heapster and returns it as a DataPromise (returns instantly).
func (ds *Drill) DownloadMetric(client client.HeapsterClient, metric string) (DataPromise) {
        dataPromise := DataPromise{
		Data: make(chan *Data, 1),
		Error: make(chan error, 1),
	}
	go func() {
		currentRawResult := HeapsterJSONFormat{}
		err := heapsterUnmarshalType(client, ds.GetTerminalPath() + "metrics/" + metric, &currentRawResult)
		if err != nil {
			dataPromise.Data <- nil
			dataPromise.Error <- err
			return
		}
		dataPoints, err := DataPointsFromMetricJSONFormat(currentRawResult)
		if err != nil {
			dataPromise.Data <- nil
			dataPromise.Error <- err
			return
		}
		// now put all inside data
		data := Data{}
		data.DataPoints = dataPoints
		data.Drill = ds.Copy()
		data.Metric = metric
		dataPromise.Data <- &data
		dataPromise.Error <- nil
		return

	}()
	return dataPromise
}

// DownloadMetrics downloads the metrics provided in parallel and returns DataPromise list.
func (ds *Drill) DownloadMetrics(client client.HeapsterClient, metrics Metrics) ([]DataPromise) {
	result := []DataPromise{}
	for _, metric := range metrics {
		result = append(result, ds.DownloadMetric(client, metric))
	}
	return result
}

// Copy the drill.
func (ds *Drill) Copy() (Drill) {
	copy := Drill{}
	for k, v := range *ds {
		copy[k] = v
	}
	return copy
}

// FakeDrillFromSelection converts selection to drill. Useful if you want to determine resource download order (because Drill
// provides appropriate method) or if you want to add label to the downloaded data.
func FakeDrillFromSelection(s NativeSelection) *Drill {
	result := Drill{}
	for k, v := range s {
		result[k] = strings.Join(v, ",")
	}
	return &result
}



// DataPointsFromMetricJSONFormat converts all the data points from format used by heapster to our format.
func DataPointsFromMetricJSONFormat(raw HeapsterJSONFormat) (DataPoints, error) {
	dp := DataPoints{}
	for _, raw := range raw.RawDataPoints {
		parsed, err := DataPointFromRawDataPoint(raw)
		if err != nil {
			return nil, err
		}
		dp = append(dp, parsed)
	}
	return dp, nil
}

// DataPointFromRawDataPoint converts raw data point supplied by heapster to our internal format.
func DataPointFromRawDataPoint(r RawDataPoint) (DataPoint, error) {
	d := DataPoint{}
	t, err := time.Parse(time.RFC3339, r.Timestamp)
	if err != nil {
		return d, err
	}
	d.X = t.Unix()
	d.Y = r.Value
	return d, nil
}

// Performs heapster GET request to the specifies path and transfers the data to the interface provided.
func heapsterUnmarshalType(client client.HeapsterClient, path string, v interface{}) error {
	rawData, err := client.Get(path).DoRaw()
	if err != nil {
		return err
	}
	json.Unmarshal(rawData, v)
	return nil
}

// Performs heapster GET request to the specifies path and returns the data it as a string list.
func heapsterUnmarshalStringList(client client.HeapsterClient, path string) ([]string, error) {
	result := make([]string, 0)
	err := heapsterUnmarshalType(client, path, &result)
	return result, err
}

// checks whether string value is present in the array.
func isInsideArray(value string, array []string) (bool) {
	for _, e := range array {
		if (value == e) {
			return true
		}
	}
	return false
}
