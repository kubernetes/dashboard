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

package graph

import (
	"time"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"errors"
	"encoding/json"
	"strings"
	"log"
)

type DataList []Data

type Data struct {
	DataPoints    `json:"dataPoints"`
	Metric    string `json:"metric"`
	Drill     `json:"drill"`
	Aggregate string `json:"aggregate,omitempty"`
}

type Labels map[string]string

type NativeSelection map[string][]string
type DerivedSelection map[string][]string

func (s *NativeSelection) Copy() (NativeSelection) {
	copy := NativeSelection{}
	for k, v := range *s {
		if v == nil {
			copy[k] = v
		}
		nv := []string{}
		for _, e := range v {
			nv = append(nv, e)
		}
		copy[k] = nv
	}
	return copy
}

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

// Structure of heapster data model
var NativeResourceDependencies = map[string]string{
//	"nodes": "",  // removed nodes as main resource! Now metrics for them will be provided as a sum of metrics from their pods
	"namespaces": "",
	"pods": "namespaces",
	"containers": "pods",
}



type MetricJSONFormat struct {
	RawDataPoints []RawDataPoint `json:"metrics"`
}

type RawDataPoint struct {
	Timestamp string `json:"timestamp"`
	Value     int64 `json:"value"`
}



type Drill map[string]string

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

// simple resolution dependency resolution algo
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

func (ds *Drill) GetTerminalPath() (string) {
	path := "/model/"
	order := ds.GetResourceResolutionOrder()
	for _, e := range order {
		path += e + "/" + (*ds)[e] + "/"
	}
	return path
}

func (ds *Drill) GetAvailableMetrics(client client.HeapsterClient) ([]string, error) {
	log.Print("")
	path := ds.GetTerminalPath() + "metrics/"
	result := make([]string, 0)
	err := heapsterUnmarshalType(client, path, &result)
	return result, err
}

func (ds *Drill) GetAvailableResources(client client.HeapsterClient, resourceName string) ([]string, error) {
	path := ds.GetTerminalPath() + resourceName + "/"
	result := make([]string, 0)
	err := heapsterUnmarshalType(client, path, &result)
	return result, err

}


func (ds *Drill) DownloadMetric(client client.HeapsterClient, metric string) (DataPromise) {
        dataPromise := DataPromise{
		Data: make(chan *Data, 1),
		Error: make(chan error, 1),
	}
	go func() {
		currentRawResult := MetricJSONFormat{}
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


func (ds *Drill) DownloadMetrics(client client.HeapsterClient, metrics Metrics) ([]DataPromise) {
	result := []DataPromise{}
	for _, metric := range metrics {
		result = append(result, ds.DownloadMetric(client, metric))
	}
	return result
}

func (ds *Drill) Copy() (Drill) {
	copy := Drill{}
	for k, v := range *ds {
		copy[k] = v
	}
	return copy
}

func FakeDrillFromSelection(s NativeSelection) *Drill {
	result := Drill{}
	for k, v := range s {
		result[k] = strings.Join(v, ",")
	}
	return &result
}

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

func DataPointsFromMetricJSONFormat(raw MetricJSONFormat) (DataPoints, error) {
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

func heapsterUnmarshalType(client client.HeapsterClient, path string, v interface{}) error {
	rawData, err := client.Get(path).DoRaw()
	if err != nil {
		return err
	}
	json.Unmarshal(rawData, v)
	return nil
}

func isInsideArray(value string, array []string) (bool) {
	for _, e := range array {
		if (value == e) {
			return true
		}
	}
	return false
}
