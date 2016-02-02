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

	restful "github.com/emicklei/go-restful"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

const (
	RequestLogString  = "Incoming %s %s %s request from %s"
	ResponseLogString = "Outcoming response to %s with %d status code"
)

// Web-service filter function used for request and response logging.
func wsLogger(req *restful.Request, resp *restful.Response, chain *restful.FilterChain) {
	log.Printf(FormatRequestLog(req))
	chain.ProcessFilter(req, resp)
	log.Printf(FormatResponseLog(resp, req))
}

// Formats request log string.
// TODO(maciaszczykm): Display request body.
func FormatRequestLog(req *restful.Request) string {
	reqURI := ""
	if req.Request.URL != nil {
		reqURI = req.Request.URL.RequestURI()
	}

	return fmt.Sprintf(RequestLogString, req.Request.Proto, req.Request.Method,
		reqURI, req.Request.RemoteAddr)
}

// Formats response log string.
// TODO(maciaszczykm): Display response content.
func FormatResponseLog(resp *restful.Response, req *restful.Request) string {
	return fmt.Sprintf(ResponseLogString, req.Request.RemoteAddr, resp.StatusCode())
}

// Creates a new HTTP handler that handles all requests to the API of the backend.
func CreateHttpApiHandler(client *client.Client, heapsterClient HeapsterClient) http.Handler {
	apiHandler := ApiHandler{client, heapsterClient}
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
	deployWs.Route(
		deployWs.POST("/validate/protocol").
			To(apiHandler.handleProtocolValidity).
			Reads(ProtocolValiditySpec{}).
			Writes(ProtocolValidity{}))
	deployWs.Route(
		deployWs.GET("/protocols").
			To(apiHandler.handleGetAvailableProcotols).
			Writes(Protocols{}))
	wsContainer.Add(deployWs)

	deployFromFileWs := new(restful.WebService)
	deployFromFileWs.Path("/api/appdeploymentfromfile").
	Consumes(restful.MIME_JSON).
	Produces(restful.MIME_JSON)
	deployFromFileWs.Route(
		deployFromFileWs.POST("").
		To(apiHandler.handleDeployFromFile).
		Reads(AppDeploymentFromFileSpec{}).
		Writes(AppDeploymentFromFileSpec{}))
	wsContainer.Add(deployFromFileWs)

	replicationControllerWs := new(restful.WebService)
	replicationControllerWs.Filter(wsLogger)
	replicationControllerWs.Path("/api/replicationcontrollers").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	replicationControllerWs.Route(
		replicationControllerWs.GET("").
			To(apiHandler.handleGetReplicationControllerList).
			Writes(ReplicationControllerList{}))
	replicationControllerWs.Route(
		replicationControllerWs.GET("/{namespace}/{replicationController}").
			To(apiHandler.handleGetReplicationControllerDetail).
			Writes(ReplicationControllerDetail{}))
	replicationControllerWs.Route(
		replicationControllerWs.POST("/{namespace}/{replicationController}/update/pods").
			To(apiHandler.handleUpdateReplicasCount).
			Reads(ReplicationControllerSpec{}))
	replicationControllerWs.Route(
		replicationControllerWs.DELETE("/{namespace}/{replicationController}").
			To(apiHandler.handleDeleteReplicationController))
	replicationControllerWs.Route(
		replicationControllerWs.GET("/pods/{namespace}/{replicationController}").
			To(apiHandler.handleGetReplicationControllerPods).
			Writes(ReplicationControllerPods{}))
	wsContainer.Add(replicationControllerWs)

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
		eventsWs.GET("/{namespace}/{replicationController}").
			To(apiHandler.handleEvents).
			Writes(Events{}))
	wsContainer.Add(eventsWs)

	secretsWs := new(restful.WebService)
	secretsWs.Path("/api/secrets").Produces(restful.MIME_JSON)
	secretsWs.Route(
		secretsWs.GET("/{namespace}").
			To(apiHandler.handleGetSecrets).
			Writes(SecretsList{}))
	secretsWs.Route(
		secretsWs.POST("").
			To(apiHandler.handleCreateImagePullSecret).
			Reads(ImagePullSecretSpec{}).
			Writes(Secret{}))
	wsContainer.Add(secretsWs)

	return wsContainer
}

type ApiHandler struct {
	client         *client.Client
	heapsterClient HeapsterClient
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

// Handles deploy from file API call.
func (apiHandler *ApiHandler) handleDeployFromFile(request *restful.Request, response *restful.Response) {
	deploymentSpec := new(AppDeploymentFromFileSpec)
	if err := request.ReadEntity(deploymentSpec); err != nil {
		handleInternalError(response, err)
		return
	}
	if err := DeployAppFromFile(deploymentSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, deploymentSpec)
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

// Handles protocol validation API call.
func (apiHandler *ApiHandler) handleProtocolValidity(request *restful.Request, response *restful.Response) {
	spec := new(ProtocolValiditySpec)
	if err := request.ReadEntity(spec); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, ValidateProtocol(spec))
}

// Handles get available protocols API call.
func (apiHandler *ApiHandler) handleGetAvailableProcotols(request *restful.Request, response *restful.Response) {
	response.WriteHeaderAndEntity(http.StatusCreated, GetAvailableProtocols())
}

// Handles get Replication Controller list API call.
func (apiHandler *ApiHandler) handleGetReplicationControllerList(
	request *restful.Request, response *restful.Response) {

	result, err := GetReplicationControllerList(apiHandler.client)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Replication Controller detail API call.
func (apiHandler *ApiHandler) handleGetReplicationControllerDetail(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicationController := request.PathParameter("replicationController")
	result, err := GetReplicationControllerDetail(apiHandler.client, apiHandler.heapsterClient, namespace, replicationController)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles update of Replication Controller pods update API call.
func (apiHandler *ApiHandler) handleUpdateReplicasCount(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicationControllerName := request.PathParameter("replicationController")
	replicationControllerSpec := new(ReplicationControllerSpec)

	if err := request.ReadEntity(replicationControllerSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	if err := UpdateReplicasCount(apiHandler.client, namespace, replicationControllerName,
		replicationControllerSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusAccepted)
}

// Handles delete Replication Controller API call.
func (apiHandler *ApiHandler) handleDeleteReplicationController(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicationController := request.PathParameter("replicationController")

	if err := DeleteReplicationControllerWithPods(apiHandler.client, namespace, replicationController); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusOK)
}

// Handles get Replication Controller Pods API call.
func (apiHandler *ApiHandler) handleGetReplicationControllerPods(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicationController := request.PathParameter("replicationController")
	limit, err := strconv.Atoi(request.QueryParameter("limit"))
	if err != nil {
		limit = 0
	}
	result, err := GetReplicationControllerPods(apiHandler.client, namespace, replicationController, limit)
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

// Handles image pull secret creation API call.
func (apiHandler *ApiHandler) handleCreateImagePullSecret(request *restful.Request, response *restful.Response) {
	secretSpec := new(ImagePullSecretSpec)
	if err := request.ReadEntity(secretSpec); err != nil {
		handleInternalError(response, err)
		return
	}
	secret, err := CreateSecret(apiHandler.client, secretSpec)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, secret)
}

// Handles get secrets list API call.
func (apiHandler *ApiHandler) handleGetSecrets(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	result, err := GetSecrets(apiHandler.client, namespace)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
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
	replicationController := request.PathParameter("replicationController")
	result, err := GetEvents(apiHandler.client, namespace, replicationController)
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
