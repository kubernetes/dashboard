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
	"net/http"

	restful "github.com/emicklei/go-restful"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// Creates a new HTTP handler that handles all requests to the API of the backend.
func CreateApiHandler(client *client.Client) http.Handler {
	wsContainer := restful.NewContainer()

	// TODO(bryk): This is for tests only. Replace with real implementation once ready.
	ws := new(restful.WebService)
	ws.Path("/api/deploy").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	ws.Route(ws.POST("").To(func(request *restful.Request, response *restful.Response) {
		cfg := new(DeployAppConfig)
		if err := request.ReadEntity(cfg); err != nil {
			HandleInternalError(response, err)
			return
		}
		if err := DeployApp(cfg, client); err != nil {
			HandleInternalError(response, err)
			return
		}

		response.WriteHeaderAndEntity(http.StatusCreated, cfg)
	}).Reads(DeployAppConfig{}).Writes(DeployAppConfig{}))

	wsContainer.Add(ws)

	return wsContainer
}

// Handler that writes the given error to the response and sets appropriate HTTP status headers.
func HandleInternalError(response *restful.Response, err error) {
	response.AddHeader("Content-Type", "text/plain")
	response.WriteErrorString(http.StatusInternalServerError, err.Error()+"\n")
}
