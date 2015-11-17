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
func CreateHttpApiHandler(client *client.Client) http.Handler {
	apiHandler := ApiHandler{client}
	wsContainer := restful.NewContainer()

	deployWs := new(restful.WebService)
	deployWs.Path("/api/deploy").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	deployWs.Route(
		deployWs.POST("").
			To(apiHandler.handleDeploy).
			Reads(AppDeployment{}).
			Writes(AppDeployment{}))
	wsContainer.Add(deployWs)

	replicaSetListWs := new(restful.WebService)
	replicaSetListWs.Path("/api/replicaset").
		Produces(restful.MIME_JSON)
	replicaSetListWs.Route(
		replicaSetListWs.GET("").
			To(apiHandler.handleGetReplicaSetList).
			Writes(ReplicaSetList{}))
	wsContainer.Add(replicaSetListWs)

	namespaceListWs := new(restful.WebService)
	namespaceListWs.Path("/api/namespace").
		Produces(restful.MIME_JSON)
	namespaceListWs.Route(
		namespaceListWs.GET("").
			To(apiHandler.handleGetNamespaceList).
			Writes(NamespacesList{}))
	wsContainer.Add(namespaceListWs)

	return wsContainer
}

type ApiHandler struct {
	client *client.Client
}

// Handles deploy API call.
func (apiHandler *ApiHandler) handleDeploy(request *restful.Request, response *restful.Response) {
	cfg := new(AppDeployment)
	if err := request.ReadEntity(cfg); err != nil {
		handleInternalError(response, err)
		return
	}
	if err := DeployApp(cfg, apiHandler.client); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, cfg)
}

// Handles get Replica Set list API call.
func (apiHandler *ApiHandler) handleGetReplicaSetList(
	request *restful.Request, response *restful.Response) {

	result, err := GetReplicaSetList(apiHandler.client)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get namespace list API call.
func (apiHandler *ApiHandler) handleGetNamespaceList(
	request *restful.Request, response *restful.Response) {

	result, err := GetNamespaceList(apiHandler.client)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handler that writes the given error to the response and sets appropriate HTTP status headers.
func handleInternalError(response *restful.Response, err error) {
	response.AddHeader("Content-Type", "text/plain")
	response.WriteErrorString(http.StatusInternalServerError, err.Error()+"\n")
}
