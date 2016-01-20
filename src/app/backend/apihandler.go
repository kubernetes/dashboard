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
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	restful "github.com/emicklei/go-restful"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

const (
	Colon             = ":"
	RequestLogString  = "Incoming %s %s %s request from %s:\n%v"
	ResponseLogString = "Outcoming response to %s with %d status code"
)

// Web-service filter function used for request and response logging.
func wsLogger(req *restful.Request, resp *restful.Response, chain *restful.FilterChain) {
	remoteAddr := GetRemoteAddr(req)
	log.Printf(FormatRequestLog(req, remoteAddr))
	chain.ProcessFilter(req, resp)
	log.Printf(FormatResponseLog(resp, remoteAddr))
}

// Returns remote address of the request (without port number).
func GetRemoteAddr(req *restful.Request) string {
	if strings.Contains(req.Request.RemoteAddr, Colon) {
		return strings.Split(req.Request.RemoteAddr, Colon)[0]
	} else {
		return req.Request.RemoteAddr
	}
}

// Formats request log string.
func FormatRequestLog(req *restful.Request, remoteAddr string) string {
	reqBody := make([]byte, req.Request.ContentLength)


	if req.Request.Body != nil {
		req.Request.Body.Read(reqBody)
	}

	reqURI := ""
	if req.Request.URL != nil {
		reqURI = req.Request.URL.RequestURI()
	}

	return fmt.Sprintf(RequestLogString, req.Request.Proto, req.Request.Method,
		reqURI, remoteAddr, reqBody)
}

// Formats response log string.
// TODO(maciaszczykm): Display response content too.
func FormatResponseLog(resp *restful.Response, remoteAddr string) string {
	return fmt.Sprintf(ResponseLogString, remoteAddr, resp.StatusCode())
}

// Creates a new HTTP handler that handles all requests to the API of the backend.
func CreateHttpApiHandler(client *client.Client) http.Handler {
	apiHandler := ApiHandler{client}
	wsContainer := restful.NewContainer()

	deployWs := new(restful.WebService)
	deployWs.Filter(wsLogger)
	deployWs.Path("/api/appdeployments").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	deployWs.Route(
		deployWs.POST("").
			To(apiHandler.handleDeploy).
			Reads(AppDeploymentSpec{}).
			Writes(AppDeploymentSpec{}))
	deployWs.Route(
		deployWs.POST("/validate/name").
			To(apiHandler.handleNameValidity).
			Reads(AppNameValiditySpec{}).
			Writes(AppNameValidity{}))
	wsContainer.Add(deployWs)

	replicaSetWs := new(restful.WebService)
	replicaSetWs.Filter(wsLogger)
	replicaSetWs.Path("/api/replicasets").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	replicaSetWs.Route(
		replicaSetWs.GET("").
			To(apiHandler.handleGetReplicaSetList).
			Writes(ReplicaSetList{}))
	replicaSetWs.Route(
		replicaSetWs.GET("/{namespace}/{replicaSet}").
			To(apiHandler.handleGetReplicaSetDetail).
			Writes(ReplicaSetDetail{}))
	replicaSetWs.Route(
		replicaSetWs.POST("/{namespace}/{replicaSet}/update/pods").
			To(apiHandler.handleUpdateReplicasCount).
			Reads(ReplicaSetSpec{}))
	replicaSetWs.Route(
		replicaSetWs.DELETE("/{namespace}/{replicaSet}").
			To(apiHandler.handleDeleteReplicaSet))
	replicaSetWs.Route(
		replicaSetWs.GET("/pods/{namespace}/{replicaSet}").
			To(apiHandler.handleGetReplicaSetPods).
			Writes(ReplicaSetPods{}))
	wsContainer.Add(replicaSetWs)

	namespacesWs := new(restful.WebService)
	namespacesWs.Filter(wsLogger)
	namespacesWs.Path("/api/namespaces").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	namespacesWs.Route(
		namespacesWs.POST("").
			To(apiHandler.handleCreateNamespace).
			Reads(NamespaceSpec{}).
			Writes(NamespaceSpec{}))
	namespacesWs.Route(
		namespacesWs.GET("").
			To(apiHandler.handleGetNamespaces).
			Writes(NamespaceList{}))
	wsContainer.Add(namespacesWs)

	logsWs := new(restful.WebService)
	logsWs.Filter(wsLogger)
	logsWs.Path("/api/logs").
		Produces(restful.MIME_JSON)
	logsWs.Route(
		logsWs.GET("/{namespace}/{podId}").
			To(apiHandler.handleLogs).
			Writes(Logs{}))
	logsWs.Route(
		logsWs.GET("/{namespace}/{podId}/{container}").
			To(apiHandler.handleLogs).
			Writes(Logs{}))
	wsContainer.Add(logsWs)

	eventsWs := new(restful.WebService)
	eventsWs.Filter(wsLogger)
	eventsWs.Path("/api/events").
		Produces(restful.MIME_JSON)
	eventsWs.Route(
		eventsWs.GET("/{namespace}/{replicaSet}").
			To(apiHandler.handleEvents).
			Writes(Events{}))
	wsContainer.Add(eventsWs)

	return wsContainer
}

type ApiHandler struct {
	client *client.Client
}

// Handles deploy API call.
func (apiHandler *ApiHandler) handleDeploy(request *restful.Request, response *restful.Response) {
	appDeploymentSpec := new(AppDeploymentSpec)
	if err := request.ReadEntity(appDeploymentSpec); err != nil {
		handleInternalError(response, err)
		return
	}
	if err := DeployApp(appDeploymentSpec, apiHandler.client); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, appDeploymentSpec)
}

// Handles app name validation API call.
func (apiHandler *ApiHandler) handleNameValidity(request *restful.Request, response *restful.Response) {
	spec := new(AppNameValiditySpec)
	if err := request.ReadEntity(spec); err != nil {
		handleInternalError(response, err)
		return
	}

	validity, err := ValidateAppName(spec, apiHandler.client)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, validity)
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

// Handles get Replica Set detail API call.
func (apiHandler *ApiHandler) handleGetReplicaSetDetail(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicaSet := request.PathParameter("replicaSet")
	result, err := GetReplicaSetDetail(apiHandler.client, namespace, replicaSet)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles update of Replica Set pods update API call.
func (apiHandler *ApiHandler) handleUpdateReplicasCount(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicaSetName := request.PathParameter("replicaSet")
	replicaSetSpec := new(ReplicaSetSpec)

	if err := request.ReadEntity(replicaSetSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	if err := UpdateReplicasCount(apiHandler.client, namespace, replicaSetName,
		replicaSetSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusAccepted)
}

// Handles delete Replica Set API call.
func (apiHandler *ApiHandler) handleDeleteReplicaSet(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicaSet := request.PathParameter("replicaSet")

	if err := DeleteReplicaSetWithPods(apiHandler.client, namespace, replicaSet); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusOK)
}

// Handles get Replica Set Pods API call.
func (apiHandler *ApiHandler) handleGetReplicaSetPods(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicaSet := request.PathParameter("replicaSet")
	limit, err := strconv.Atoi(request.QueryParameter("limit"))
	if err != nil {
		limit = 0
	}
	result, err := GetReplicaSetPods(apiHandler.client, namespace, replicaSet, limit)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles namespace creation API call.
func (apiHandler *ApiHandler) handleCreateNamespace(request *restful.Request,
	response *restful.Response) {
	namespaceSpec := new(NamespaceSpec)
	if err := request.ReadEntity(namespaceSpec); err != nil {
		handleInternalError(response, err)
		return
	}
	if err := CreateNamespace(namespaceSpec, apiHandler.client); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, namespaceSpec)
}

// Handles get namespace list API call.
func (apiHandler *ApiHandler) handleGetNamespaces(
	request *restful.Request, response *restful.Response) {

	result, err := GetNamespaceList(apiHandler.client)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles log API call.
func (apiHandler *ApiHandler) handleLogs(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	podId := request.PathParameter("podId")
	container := request.PathParameter("container")
	var containerPtr *string = nil
	if len(container) > 0 {
		containerPtr = &container
	}
	result, err := GetPodLogs(apiHandler.client, namespace, podId, containerPtr)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles event API call.
func (apiHandler *ApiHandler) handleEvents(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	replicaSet := request.PathParameter("replicaSet")
	result, err := GetEvents(apiHandler.client, namespace, replicaSet)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handler that writes the given error to the response and sets appropriate HTTP status headers.
func handleInternalError(response *restful.Response, err error) {
	log.Print(err)
	response.AddHeader("Content-Type", "text/plain")
	response.WriteErrorString(http.StatusInternalServerError, err.Error()+"\n")
}
