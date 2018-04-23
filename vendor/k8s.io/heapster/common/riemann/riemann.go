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

package riemann

import (
	"net/url"
	"runtime"
	"strconv"
	"sync"
	"time"

	"github.com/golang/glog"
	"github.com/riemann/riemann-go-client"
)

// Used to store the Riemann configuration specified in the Heapster cli
type RiemannConfig struct {
	Host      string
	Ttl       float32
	State     string
	Tags      []string
	BatchSize int
}

// contains the riemann client, the riemann configuration, and a RWMutex
type RiemannSink struct {
	Client riemanngo.Client
	Config RiemannConfig
	sync.RWMutex
}

// creates a Riemann sink. Returns a riemannSink
func CreateRiemannSink(uri *url.URL) (*RiemannSink, error) {
	// Default configuration
	c := RiemannConfig{
		Host:      "riemann-heapster:5555",
		Ttl:       60.0,
		State:     "",
		Tags:      make([]string, 0),
		BatchSize: 1000,
	}
	// check host
	if len(uri.Host) > 0 {
		c.Host = uri.Host
	}
	options := uri.Query()
	// check ttl
	if len(options["ttl"]) > 0 {
		var ttl, err = strconv.ParseFloat(options["ttl"][0], 32)
		if err != nil {
			return nil, err
		}
		c.Ttl = float32(ttl)
	}
	// check batch size
	if len(options["batchsize"]) > 0 {
		var batchSize, err = strconv.Atoi(options["batchsize"][0])
		if err != nil {
			return nil, err
		}
		c.BatchSize = batchSize
	}
	// check state
	if len(options["state"]) > 0 {
		c.State = options["state"][0]
	}
	// check tags
	if len(options["tags"]) > 0 {
		c.Tags = options["tags"]
	} else {
		c.Tags = []string{"heapster"}
	}

	glog.Infof("Riemann sink URI: '%+v', host: '%+v', options: '%+v', ", uri, c.Host, options)
	rs := &RiemannSink{
		Client: nil,
		Config: c,
	}
	client, err := GetRiemannClient(rs.Config)
	if err != nil {
		glog.Warningf("Riemann sink not connected: %v", err)
		// Warn but return the sink => the client in the sink can be nil
	}
	rs.Client = client

	return rs, nil
}

// Receives a sink, connect the riemann client.
func GetRiemannClient(config RiemannConfig) (riemanngo.Client, error) {
	glog.Infof("Connect Riemann client...")
	client := riemanngo.NewTcpClient(config.Host)
	runtime.SetFinalizer(client, func(c riemanngo.Client) { c.Close() })
	// 5 seconds timeout
	err := client.Connect(5)
	if err != nil {
		return nil, err
	}
	return client, nil
}

// Send Events to Riemann using the client from the sink.
func SendData(client riemanngo.Client, events []riemanngo.Event) error {
	// do nothing if we are not connected
	if client == nil {
		glog.Warningf("Riemann sink not connected")
		return nil
	}
	start := time.Now()
	_, err := riemanngo.SendEvents(client, &events)
	end := time.Now()
	if err == nil {
		glog.V(4).Infof("Exported %d events to riemann in %s", len(events), end.Sub(start))
		return nil
	} else {
		glog.Warningf("There were errors sending events to Riemman, forcing reconnection. Error : %+v", err)
		return err
	}
}
