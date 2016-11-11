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
	"log"
	"net/http"
	"os"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/handler"
	"github.com/spf13/pflag"
)

var (
	argPort          = pflag.Int("port", 9090, "The port to listen to for incoming HTTP requests")
	argApiserverHost = pflag.String("apiserver-host", "", "The address of the Kubernetes Apiserver "+
		"to connect to in the format of protocol://address:port, e.g., "+
		"http://localhost:8080. If not specified, the assumption is that the binary runs inside a "+
		"Kubernetes cluster and local discovery is attempted.")
	argHeapsterHost = pflag.String("heapster-host", "", "The address of the Heapster Apiserver "+
		"to connect to in the format of protocol://address:port, e.g., "+
		"http://localhost:8082. If not specified, the assumption is that the binary runs inside a "+
		"Kubernetes cluster and service proxy will be used.")
	argKubeConfigFile = pflag.String("kubeconfig", "", "Path to kubeconfig file with authorization and master location information.")
)

func main() {
	// Set logging output to standard console out
	log.SetOutput(os.Stdout)

	pflag.CommandLine.AddGoFlagSet(flag.CommandLine)
	pflag.Parse()
	flag.CommandLine.Parse(make([]string, 0)) // Init for glog calls in kubernetes packages

	log.Printf("Using HTTP port: %d", *argPort)
	if *argApiserverHost != "" {
		log.Printf("Using apiserver-host location: %s", *argApiserverHost)
	}
	if *argKubeConfigFile != "" {
		log.Printf("Using kubeconfig file: %s", *argKubeConfigFile)
	}

	apiserverClient, config, err := client.CreateApiserverClient(*argApiserverHost, *argKubeConfigFile)
	if err != nil {
		handleFatalInitError(err)
	}

	versionInfo, err := apiserverClient.ServerVersion()
	if err != nil {
		handleFatalInitError(err)
	}
	log.Printf("Successful initial request to the apiserver, version: %s", versionInfo.String())

	heapsterRESTClient, err := client.CreateHeapsterRESTClient(*argHeapsterHost, apiserverClient)
	if err != nil {
		log.Printf("Could not create heapster client: %s. Continuing.", err)
	}

	// Run a HTTP server that serves static public files from './public' and handles API calls.
	// TODO(bryk): Disable directory listing.
	http.Handle("/", handler.MakeGzipHandler(handler.CreateLocaleHandler()))
	http.Handle("/api/", handler.CreateHTTPAPIHandler(apiserverClient, heapsterRESTClient, config))
	// TODO(maciaszczykm): Move to /appConfig.json as it was discussed in #640.
	http.Handle("/api/appConfig.json", handler.AppHandler(handler.ConfigHandler))
	log.Print(http.ListenAndServe(fmt.Sprintf(":%d", *argPort), nil))
}

/**
 * Handles fatal init error that prevents server from doing any work. Prints verbose error
 * message and quits the server.
 */
func handleFatalInitError(err error) {
	log.Fatalf("Error while initializing connection to Kubernetes apiserver. "+
		"This most likely means that the cluster is misconfigured (e.g., it has "+
		"invalid apiserver certificates or service accounts configuration) or the "+
		"--apiserver-host param points to a server that does not exist. Reason: %s\n"+
		"Refer to the troubleshooting guide for more information: "+
		"https://github.com/kubernetes/dashboard/blob/master/docs/user-guide/troubleshooting.md", err)
}
