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

package common

import (
	"time"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"encoding/json"
)


// HeapsterJSONFormat represents format of JSON used by heapster when sending multiple data cells
type HeapsterJSONAllInOneFormat struct {
	Items []HeapsterJSONFormat  `json:"items"`
}

// HeapsterJSONFormat represents format of JSON used by heapster when sending single data cell
type HeapsterJSONFormat struct {
	RawDataPoints []RawDataPoint `json:"metrics"`
}

// RawDataPoint as used in heapster representation
type RawDataPoint struct {
	Timestamp string `json:"timestamp"`
	Value     int64 `json:"value"`
}


// DataPointsFromMetricJSONFormat converts all the data points from format used by heapster to our format.
func DataPointsFromMetricJSONFormat(raw HeapsterJSONFormat) (DataPoints, error) {
	dp := DataPoints{}
	for _, raw := range raw.RawDataPoints {
		parsed, err := dataPointFromRawDataPoint(raw)
		if err != nil {
			return nil, err
		}
		dp = append(dp, parsed)
	}
	return dp, nil
}

// DataPointFromRawDataPoint converts raw data point supplied by heapster to our internal format.
func dataPointFromRawDataPoint(r RawDataPoint) (DataPoint, error) {
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
func HeapsterUnmarshalType(client client.HeapsterClient, path string, v interface{}) error {
	rawData, err := client.Get("/model/" + path).DoRaw()
	if err != nil {
		return err
	}
	return json.Unmarshal(rawData, v)
}

// Performs heapster GET request to the specifies path and returns the data it as a string list.
func HeapsterUnmarshalStringList(client client.HeapsterClient, path string) ([]string, error) {
	result := make([]string, 0)
	err := HeapsterUnmarshalType(client, path, &result)
	return result, err
}
