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

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Measurement struct {
	Name  string            `json:"name,omitempty"`
	Value float64           `json:"value,omitempty"`
	Tags  map[string]string `json:"tags,omitempty"`
	Time  int64             `json:"time,omitempty"`
}

type request struct {
	Tags         map[string]string `json:"tags,omitempty"`
	Measurements []Measurement     `json:"measurements,omitempty"`
}

type Client interface {
	Write([]Measurement) error
}

type LibratoClient struct {
	httpClient *http.Client
	config     LibratoConfig
}

func (c *LibratoClient) Write(measurements []Measurement) error {
	b, err := json.Marshal(&request{
		Measurements: measurements,
		Tags:         c.config.Tags,
	})
	if nil != err {
		return err
	}
	req, err := http.NewRequest(
		"POST",
		c.config.API+"/v1/measurements",
		bytes.NewBuffer(b),
	)
	if nil != err {
		return err
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Set("User-Agent", "heapster")
	req.SetBasicAuth(c.config.Username, c.config.Token)
	_, err = c.httpClient.Do(req)
	return err
}

type LibratoConfig struct {
	Username string
	Token    string
	API      string
	Prefix   string
	Tags     map[string]string
}

func NewClient(c LibratoConfig) *LibratoClient {
	var netTransport = &http.Transport{
		Dial: (&net.Dialer{
			Timeout: 5 * time.Second,
		}).Dial,
		TLSHandshakeTimeout: 5 * time.Second,
	}
	var httpClient = &http.Client{
		Timeout:   time.Second * 10,
		Transport: netTransport,
	}

	client := &LibratoClient{httpClient: httpClient, config: c}
	return client
}

func BuildConfig(uri *url.URL) (*LibratoConfig, error) {
	config := LibratoConfig{API: "https://metrics-api.librato.com", Prefix: ""}

	opts := uri.Query()
	if len(opts["username"]) >= 1 {
		config.Username = opts["username"][0]
	} else {
		return nil, fmt.Errorf("no `username` flag specified")
	}
	// TODO: use more secure way to pass the password.
	if len(opts["token"]) >= 1 {
		config.Token = opts["token"][0]
	} else {
		return nil, fmt.Errorf("no `token` flag specified")
	}
	if len(opts["api"]) >= 1 {
		config.API = opts["api"][0]
	}
	if len(opts["prefix"]) >= 1 {
		config.Prefix = opts["prefix"][0]

		if !strings.HasSuffix(config.Prefix, ".") {
			config.Prefix = config.Prefix + "."
		}
	}
	if len(opts["tags"]) >= 1 {
		config.Tags = make(map[string]string)

		tagNames := strings.Split(opts["tags"][0], ",")

		for _, tagName := range tagNames {
			if val, ok := opts["tag_"+tagName]; ok {
				config.Tags[tagName] = val[0]
			}
		}
	}

	return &config, nil
}
