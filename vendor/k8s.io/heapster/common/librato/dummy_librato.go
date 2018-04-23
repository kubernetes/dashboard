// Copyright 2017 Google Inc. All Rights Reserved.
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

package librato

type MeasurementsSavedToLibrato struct {
	Measurement Measurement
}

type FakeLibratoClient struct {
	Measurements []MeasurementsSavedToLibrato
}

func NewFakeLibratoClient() *FakeLibratoClient {
	return &FakeLibratoClient{[]MeasurementsSavedToLibrato{}}
}

func (client *FakeLibratoClient) Write(measurements []Measurement) error {
	for _, measurement := range measurements {
		client.Measurements = append(client.Measurements, MeasurementsSavedToLibrato{measurement})
	}
	return nil
}

var FakeClient = NewFakeLibratoClient()

var Config = LibratoConfig{
	Username: "root",
	Token:    "root",
}
