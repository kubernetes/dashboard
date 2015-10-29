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

package main

import (
	"flag"
	"fmt"
	"net/http"

	"github.com/golang/glog"
	"github.com/spf13/pflag"
)

var (
	argPort = pflag.Int("port", 8080, "The port to listen to for incomming HTTP requests")
)

func main() {
	pflag.CommandLine.AddGoFlagSet(flag.CommandLine)
	pflag.Parse()
	glog.Info("Starting HTTP server on port ", *argPort)
	defer glog.Flush()

	// Run a HTTP server that serves static files from current directory.
	// TODO(bryk): Disable directory listing.
	http.Handle("/", http.FileServer(http.Dir("./")))
	glog.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *argPort), nil))
}
