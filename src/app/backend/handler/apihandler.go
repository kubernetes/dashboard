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

package handler

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	restful "github.com/emicklei/go-restful"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/configmap"
	"github.com/kubernetes/dashboard/src/app/backend/resource/container"
	"github.com/kubernetes/dashboard/src/app/backend/resource/daemonset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/deployment"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job"
	"github.com/kubernetes/dashboard/src/app/backend/resource/namespace"
	"github.com/kubernetes/dashboard/src/app/backend/resource/node"
	"github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolume"
	"github.com/kubernetes/dashboard/src/app/backend/resource/petset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicationcontroller"
	"github.com/kubernetes/dashboard/src/app/backend/resource/secret"
	resourceService "github.com/kubernetes/dashboard/src/app/backend/resource/service"
	"github.com/kubernetes/dashboard/src/app/backend/resource/workload"
	"github.com/kubernetes/dashboard/src/app/backend/validation"
	clientK8s "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/client/unversioned/clientcmd"
	"k8s.io/kubernetes/pkg/runtime"
)

const (
	// RequestLogString is a template for request log message.
	RequestLogString = "[%s] Incoming %s %s %s request from %s"

	// ResponseLogString is a template for response log message.
	ResponseLogString = "[%s] Outcoming response to %s with %d status code"
)

// APIHandler is a representation of API handler. Structure contains client, Heapster client and
// client configuration.
type APIHandler struct {
	client         *clientK8s.Client
	heapsterClient client.HeapsterClient
	clientConfig   clientcmd.ClientConfig
	verber         common.ResourceVerber
}

// Web-service filter function used for request and response logging.
func wsLogger(req *restful.Request, resp *restful.Response, chain *restful.FilterChain) {
	log.Printf(FormatRequestLog(req))
	chain.ProcessFilter(req, resp)
	log.Printf(FormatResponseLog(resp, req))
}

// FormatRequestLog formats request log string.
// TODO(maciaszczykm): Display request body.
func FormatRequestLog(req *restful.Request) string {
	reqURI := ""
	if req.Request.URL != nil {
		reqURI = req.Request.URL.RequestURI()
	}

	return fmt.Sprintf(RequestLogString, time.Now().Format(time.RFC3339), req.Request.Proto,
		req.Request.Method, reqURI, req.Request.RemoteAddr)
}

// FormatResponseLog formats response log string.
// TODO(maciaszczykm): Display response content.
func FormatResponseLog(resp *restful.Response, req *restful.Request) string {
	return fmt.Sprintf(ResponseLogString, time.Now().Format(time.RFC3339),
		req.Request.RemoteAddr, resp.StatusCode())
}

// CreateHTTPAPIHandler creates a new HTTP handler that handles all requests to the API of the backend.
func CreateHTTPAPIHandler(client *clientK8s.Client, heapsterClient client.HeapsterClient,
	clientConfig clientcmd.ClientConfig) http.Handler {

	verber := common.NewResourceVerber(client.RESTClient, client.ExtensionsClient.RESTClient,
		client.AppsClient.RESTClient, client.BatchClient.RESTClient)
	apiHandler := APIHandler{client, heapsterClient, clientConfig, verber}
	wsContainer := restful.NewContainer()
	wsContainer.EnableContentEncoding(true)

	apiV1Ws := new(restful.WebService)
	apiV1Ws.Filter(wsLogger)
	apiV1Ws.Path("/api/v1").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	wsContainer.Add(apiV1Ws)

	apiV1Ws.Route(
		apiV1Ws.POST("/appdeployment").
			To(apiHandler.handleDeploy).
			Reads(replicationcontroller.AppDeploymentSpec{}).
			Writes(replicationcontroller.AppDeploymentSpec{}))
	apiV1Ws.Route(
		apiV1Ws.POST("/appdeployment/validate/name").
			To(apiHandler.handleNameValidity).
			Reads(validation.AppNameValiditySpec{}).
			Writes(validation.AppNameValidity{}))
	apiV1Ws.Route(
		apiV1Ws.POST("/appdeployment/validate/imagereference").
			To(apiHandler.handleImageReferenceValidity).
			Reads(validation.ImageReferenceValiditySpec{}).
			Writes(validation.ImageReferenceValidity{}))
	apiV1Ws.Route(
		apiV1Ws.POST("/appdeployment/validate/protocol").
			To(apiHandler.handleProtocolValidity).
			Reads(validation.ProtocolValiditySpec{}).
			Writes(validation.ProtocolValidity{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/appdeployment/protocols").
			To(apiHandler.handleGetAvailableProcotols).
			Writes(replicationcontroller.Protocols{}))

	apiV1Ws.Route(
		apiV1Ws.POST("/appdeploymentfromfile").
			To(apiHandler.handleDeployFromFile).
			Reads(replicationcontroller.AppDeploymentFromFileSpec{}).
			Writes(replicationcontroller.AppDeploymentFromFileResponse{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller").
			To(apiHandler.handleGetReplicationControllerList).
			Writes(replicationcontroller.ReplicationControllerList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller/{namespace}").
			To(apiHandler.handleGetReplicationControllerList).
			Writes(replicationcontroller.ReplicationControllerList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller/{namespace}/{replicationController}").
			To(apiHandler.handleGetReplicationControllerDetail).
			Writes(replicationcontroller.ReplicationControllerDetail{}))
	apiV1Ws.Route(
		apiV1Ws.POST("/replicationcontroller/{namespace}/{replicationController}/update/pod").
			To(apiHandler.handleUpdateReplicasCount).
			Reads(replicationcontroller.ReplicationControllerSpec{}))
	apiV1Ws.Route(
		apiV1Ws.DELETE("/replicationcontroller/{namespace}/{replicationController}").
			To(apiHandler.handleDeleteReplicationController))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller/{namespace}/{replicationController}/pod").
			To(apiHandler.handleGetReplicationControllerPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller/{namespace}/{replicationController}/event").
			To(apiHandler.handleGetReplicationControllerEvents).
			Writes(common.EventList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller/{namespace}/{replicationController}/service").
			To(apiHandler.handleGetReplicationControllerServices).
			Writes(resourceService.ServiceList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/workload").
			To(apiHandler.handleGetWorkloads).
			Writes(workload.Workloads{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/workload/{namespace}").
			To(apiHandler.handleGetWorkloads).
			Writes(workload.Workloads{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset").
			To(apiHandler.handleGetReplicaSets).
			Writes(replicaset.ReplicaSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset/{namespace}").
			To(apiHandler.handleGetReplicaSets).
			Writes(replicaset.ReplicaSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset/{namespace}/{replicaSet}").
			To(apiHandler.handleGetReplicaSetDetail).
			Writes(replicaset.ReplicaSetDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset/{namespace}/{replicaSet}/pod").
			To(apiHandler.handleGetReplicaSetPods).
			Writes(pod.PodList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/pod").
			To(apiHandler.handleGetPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/pod/{namespace}").
			To(apiHandler.handleGetPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/pod/{namespace}/{pod}").
			To(apiHandler.handleGetPodDetail).
			Writes(pod.PodDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/pod/{namespace}/{pod}/container").
			To(apiHandler.handleGetPodContainers).
			Writes(pod.PodDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/pod/{namespace}/{pod}/log").
			To(apiHandler.handleLogs).
			Writes(container.Logs{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/pod/{namespace}/{pod}/log/{container}").
			To(apiHandler.handleLogs).
			Writes(container.Logs{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/deployment").
			To(apiHandler.handleGetDeployments).
			Writes(deployment.DeploymentList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/deployment/{namespace}").
			To(apiHandler.handleGetDeployments).
			Writes(deployment.DeploymentList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/deployment/{namespace}/{deployment}").
			To(apiHandler.handleGetDeploymentDetail).
			Writes(deployment.DeploymentDetail{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset").
			To(apiHandler.handleGetDaemonSetList).
			Writes(daemonset.DaemonSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}").
			To(apiHandler.handleGetDaemonSetList).
			Writes(daemonset.DaemonSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}/{daemonSet}").
			To(apiHandler.handleGetDaemonSetDetail).
			Writes(daemonset.DaemonSetDetail{}))
	apiV1Ws.Route(
		apiV1Ws.DELETE("/daemonset/{namespace}/{daemonSet}").
			To(apiHandler.handleDeleteDaemonSet))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}/{daemonSet}/pod").
			To(apiHandler.handleGetDaemonSetPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}/{daemonSet}/service").
			To(apiHandler.handleGetDaemonSetPods).
			Writes(resourceService.ServiceList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/job").
			To(apiHandler.handleGetJobList).
			Writes(job.JobList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/job/{namespace}").
			To(apiHandler.handleGetJobList).
			Writes(job.JobList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/job/{namespace}/{job}").
			To(apiHandler.handleGetJobDetail).
			Writes(job.JobDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/job/{namespace}/{job}/pod").
			To(apiHandler.handleGetJobPods).
			Writes(pod.PodList{}))

	apiV1Ws.Route(
		apiV1Ws.POST("/namespace").
			To(apiHandler.handleCreateNamespace).
			Reads(namespace.NamespaceSpec{}).
			Writes(namespace.NamespaceSpec{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/namespace").
			To(apiHandler.handleGetNamespaces).
			Writes(namespace.NamespaceList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/namespace/{name}").
			To(apiHandler.handleGetNamespaceDetail).
			Writes(namespace.NamespaceDetail{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/secret").
			To(apiHandler.handleGetSecretList).
			Writes(secret.SecretList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/secret/{namespace}").
			To(apiHandler.handleGetSecretList).
			Writes(secret.SecretList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/secret/{namespace}/{name}").
			To(apiHandler.handleGetSecretDetail).
			Writes(secret.SecretDetail{}))
	apiV1Ws.Route(
		apiV1Ws.POST("/secret").
			To(apiHandler.handleCreateImagePullSecret).
			Reads(secret.ImagePullSecretSpec{}).
			Writes(secret.Secret{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/configmap").
			To(apiHandler.handleGetConfigMapList).
			Writes(configmap.ConfigMapList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/configmap/{namespace}").
			To(apiHandler.handleGetConfigMapList).
			Writes(configmap.ConfigMapList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/configmap/{namespace}/{configmap}").
			To(apiHandler.handleGetConfigMapDetail).
			Writes(configmap.ConfigMapDetail{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/service").
			To(apiHandler.handleGetServiceList).
			Writes(resourceService.ServiceList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/service/{namespace}").
			To(apiHandler.handleGetServiceList).
			Writes(resourceService.ServiceList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/service/{namespace}/{service}").
			To(apiHandler.handleGetServiceDetail).
			Writes(resourceService.ServiceDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/service/{namespace}/{service}/pod").
			To(apiHandler.handleGetServicePods).
			Writes(pod.PodList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/petset").
			To(apiHandler.handleGetPetSetList).
			Writes(petset.PetSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/petset/{namespace}").
			To(apiHandler.handleGetPetSetList).
			Writes(petset.PetSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/petset/{namespace}/{petset}").
			To(apiHandler.handleGetPetSetDetail).
			Writes(petset.PetSetDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/petset/{namespace}/{petset}/pod").
			To(apiHandler.handleGetPetSetPods).
			Writes(pod.PodList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/node").
			To(apiHandler.handleGetNodeList).
			Writes(node.NodeList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/node/{name}").
			To(apiHandler.handleGetNodeDetail).
			Writes(node.NodeDetail{}))

	apiV1Ws.Route(
		apiV1Ws.DELETE("/{kind}/namespace/{namespace}/name/{name}").
			To(apiHandler.handleDeleteResource))
	apiV1Ws.Route(
		apiV1Ws.GET("/{kind}/namespace/{namespace}/name/{name}").
			To(apiHandler.handleGetResource))
	apiV1Ws.Route(
		apiV1Ws.PUT("/{kind}/namespace/{namespace}/name/{name}").
			To(apiHandler.handlePutResource))

	apiV1Ws.Route(
		apiV1Ws.GET("/persistentvolume").
			To(apiHandler.handleGetPersistentVolumeList).
			Writes(persistentvolume.PersistentVolumeList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/persistentvolume/{persistentvolume}").
			To(apiHandler.handleGetPersistentVolumeDetail).
			Writes(persistentvolume.PersistentVolumeDetail{}))
	return wsContainer
}

// Handles get pet set list API call.
func (apiHandler *APIHandler) handleGetPetSetList(request *restful.Request,
	response *restful.Response) {
	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := petset.GetPetSetList(apiHandler.client, namespace, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get pet set detail API call.
func (apiHandler *APIHandler) handleGetPetSetDetail(request *restful.Request,
	response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("petset")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := petset.GetPetSetDetail(apiHandler.client, apiHandler.heapsterClient,
		namespace, name, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get pet set pods API call.
func (apiHandler *APIHandler) handleGetPetSetPods(request *restful.Request,
	response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("petset")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := petset.GetPetSetPods(apiHandler.client, apiHandler.heapsterClient,
		dataSelect, name, namespace)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get service list API call.
func (apiHandler *APIHandler) handleGetServiceList(request *restful.Request, response *restful.Response) {
	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := resourceService.GetServiceList(apiHandler.client, namespace, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get service detail API call.
func (apiHandler *APIHandler) handleGetServiceDetail(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	service := request.PathParameter("service")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := resourceService.GetServiceDetail(apiHandler.client, apiHandler.heapsterClient,
		namespace, service, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get service pods API call.
func (apiHandler *APIHandler) handleGetServicePods(request *restful.Request,
	response *restful.Response) {

	namespace := request.PathParameter("namespace")
	service := request.PathParameter("service")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := resourceService.GetServicePods(apiHandler.client, apiHandler.heapsterClient,
		namespace, service, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get node list API call.
func (apiHandler *APIHandler) handleGetNodeList(request *restful.Request, response *restful.Response) {
	dataSelect := parseDataSelectPathParameter(request)
	result, err := node.GetNodeList(apiHandler.client, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get node detail API call.
func (apiHandler *APIHandler) handleGetNodeDetail(request *restful.Request, response *restful.Response) {
	name := request.PathParameter("name")
	result, err := node.GetNodeDetail(apiHandler.client, apiHandler.heapsterClient, name)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles deploy API call.
func (apiHandler *APIHandler) handleDeploy(request *restful.Request, response *restful.Response) {
	appDeploymentSpec := new(replicationcontroller.AppDeploymentSpec)
	if err := request.ReadEntity(appDeploymentSpec); err != nil {
		handleInternalError(response, err)
		return
	}
	if err := replicationcontroller.DeployApp(appDeploymentSpec, apiHandler.client); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, appDeploymentSpec)
}

// Handles deploy from file API call.
func (apiHandler *APIHandler) handleDeployFromFile(request *restful.Request, response *restful.Response) {
	deploymentSpec := new(replicationcontroller.AppDeploymentFromFileSpec)
	if err := request.ReadEntity(deploymentSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	isDeployed, err := replicationcontroller.DeployAppFromFile(
		deploymentSpec, replicationcontroller.CreateObjectFromInfoFn, apiHandler.clientConfig)
	if !isDeployed {
		handleInternalError(response, err)
		return
	}

	errorMessage := ""
	if err != nil {
		errorMessage = err.Error()
	}

	response.WriteHeaderAndEntity(http.StatusCreated, replicationcontroller.AppDeploymentFromFileResponse{
		Name:    deploymentSpec.Name,
		Content: deploymentSpec.Content,
		Error:   errorMessage,
	})
}

// Handles app name validation API call.
func (apiHandler *APIHandler) handleNameValidity(request *restful.Request, response *restful.Response) {
	spec := new(validation.AppNameValiditySpec)
	if err := request.ReadEntity(spec); err != nil {
		handleInternalError(response, err)
		return
	}

	validity, err := validation.ValidateAppName(spec, apiHandler.client)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, validity)
}

// Handles image reference validation API call.
func (APIHandler *APIHandler) handleImageReferenceValidity(request *restful.Request, response *restful.Response) {
	spec := new(validation.ImageReferenceValiditySpec)
	if err := request.ReadEntity(spec); err != nil {
		handleInternalError(response, err)
		return
	}

	validity, err := validation.ValidateImageReference(spec)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, validity)
}

// Handles protocol validation API call.
func (apiHandler *APIHandler) handleProtocolValidity(request *restful.Request, response *restful.Response) {
	spec := new(validation.ProtocolValiditySpec)
	if err := request.ReadEntity(spec); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, validation.ValidateProtocol(spec))
}

// Handles get available protocols API call.
func (apiHandler *APIHandler) handleGetAvailableProcotols(request *restful.Request, response *restful.Response) {
	response.WriteHeaderAndEntity(http.StatusCreated, replicationcontroller.GetAvailableProtocols())
}

// Handles get Replication Controller list API call.
func (apiHandler *APIHandler) handleGetReplicationControllerList(
	request *restful.Request, response *restful.Response) {

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := replicationcontroller.GetReplicationControllerList(apiHandler.client, namespace, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Workloads list API call.
func (apiHandler *APIHandler) handleGetWorkloads(
	request *restful.Request, response *restful.Response) {

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := workload.GetWorkloads(apiHandler.client, apiHandler.heapsterClient, namespace,
		dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Replica Sets list API call.
func (apiHandler *APIHandler) handleGetReplicaSets(
	request *restful.Request, response *restful.Response) {

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := replicaset.GetReplicaSetList(apiHandler.client, namespace, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Replica Sets Detail API call.
func (apiHandler *APIHandler) handleGetReplicaSetDetail(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicaSet := request.PathParameter("replicaSet")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := replicaset.GetReplicaSetDetail(apiHandler.client, apiHandler.heapsterClient,
		dataSelect, namespace, replicaSet)

	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Replica Sets pods API call.
func (apiHandler *APIHandler) handleGetReplicaSetPods(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicaSet := request.PathParameter("replicaSet")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := replicaset.GetReplicaSetPods(apiHandler.client, apiHandler.heapsterClient,
		dataSelect, replicaSet, namespace)

	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Replica Set services API call.
func (apiHandler *APIHandler) handleGetReplicaSetServices(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicaSet := request.PathParameter("replicaSet")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := replicaset.GetReplicaSetServices(apiHandler.client, dataSelect, namespace,
		replicaSet)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Deployment list API call.
func (apiHandler *APIHandler) handleGetDeployments(
	request *restful.Request, response *restful.Response) {

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := deployment.GetDeploymentList(apiHandler.client, namespace, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Deployment detail API call.
func (apiHandler *APIHandler) handleGetDeploymentDetail(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("deployment")
	result, err := deployment.GetDeploymentDetail(apiHandler.client, namespace,
		name)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusOK, result)
}

// Handles get Pod list API call.
func (apiHandler *APIHandler) handleGetPods(
	request *restful.Request, response *restful.Response) {

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := pod.GetPodList(apiHandler.client, apiHandler.heapsterClient, namespace, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Pod detail API call.
func (apiHandler *APIHandler) handleGetPodDetail(request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	podName := request.PathParameter("pod")
	result, err := pod.GetPodDetail(apiHandler.client, apiHandler.heapsterClient, namespace, podName)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Replication Controller detail API call.
func (apiHandler *APIHandler) handleGetReplicationControllerDetail(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicationController := request.PathParameter("replicationController")
	result, err := replicationcontroller.GetReplicationControllerDetail(apiHandler.client,
		apiHandler.heapsterClient, namespace, replicationController)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles update of Replication Controller pods update API call.
func (apiHandler *APIHandler) handleUpdateReplicasCount(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicationControllerName := request.PathParameter("replicationController")
	replicationControllerSpec := new(replicationcontroller.ReplicationControllerSpec)

	if err := request.ReadEntity(replicationControllerSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	if err := replicationcontroller.UpdateReplicasCount(apiHandler.client, namespace, replicationControllerName,
		replicationControllerSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusAccepted)
}

// Handles delete Replication Controller API call.
// TODO(floreks): there has to be some kind of transaction here
func (apiHandler *APIHandler) handleDeleteReplicationController(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicationController := request.PathParameter("replicationController")
	deleteServices, err := strconv.ParseBool(request.QueryParameter("deleteServices"))
	if err != nil {
		handleInternalError(response, err)
		return
	}

	if err := replicationcontroller.DeleteReplicationController(apiHandler.client, namespace,
		replicationController, deleteServices); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusOK)
}

func (apiHandler *APIHandler) handleGetResource(
	request *restful.Request, response *restful.Response) {
	kind := request.PathParameter("kind")
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")

	result, err := apiHandler.verber.Get(kind, namespace, name)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

func (apiHandler *APIHandler) handlePutResource(
	request *restful.Request, response *restful.Response) {
	kind := request.PathParameter("kind")
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	putSpec := &runtime.Unknown{}
	if err := request.ReadEntity(putSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	if err := apiHandler.verber.Put(kind, namespace, name, putSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusOK)
}

func (apiHandler *APIHandler) handleDeleteResource(
	request *restful.Request, response *restful.Response) {
	kind := request.PathParameter("kind")
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")

	if err := apiHandler.verber.Delete(kind, namespace, name); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusOK)
}

// Handles get Replication Controller Pods API call.
func (apiHandler *APIHandler) handleGetReplicationControllerPods(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	replicationController := request.PathParameter("replicationController")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := replicationcontroller.GetReplicationControllerPods(apiHandler.client, apiHandler.heapsterClient,
		dataSelect, replicationController, namespace)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles namespace creation API call.
func (apiHandler *APIHandler) handleCreateNamespace(request *restful.Request,
	response *restful.Response) {
	namespaceSpec := new(namespace.NamespaceSpec)
	if err := request.ReadEntity(namespaceSpec); err != nil {
		handleInternalError(response, err)
		return
	}
	if err := namespace.CreateNamespace(namespaceSpec, apiHandler.client); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, namespaceSpec)
}

// Handles get namespace list API call.
func (apiHandler *APIHandler) handleGetNamespaces(
	request *restful.Request, response *restful.Response) {

	dataSelect := parseDataSelectPathParameter(request)
	result, err := namespace.GetNamespaceList(apiHandler.client, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get namespace detail API call.
func (apiHandler *APIHandler) handleGetNamespaceDetail(request *restful.Request,
	response *restful.Response) {
	name := request.PathParameter("name")
	result, err := namespace.GetNamespaceDetail(apiHandler.client, apiHandler.heapsterClient, name)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles image pull secret creation API call.
func (apiHandler *APIHandler) handleCreateImagePullSecret(request *restful.Request, response *restful.Response) {
	secretSpec := new(secret.ImagePullSecretSpec)
	if err := request.ReadEntity(secretSpec); err != nil {
		handleInternalError(response, err)
		return
	}
	secret, err := secret.CreateSecret(apiHandler.client, secretSpec)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, secret)
}

func (apiHandler *APIHandler) handleGetSecretDetail(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	result, err := secret.GetSecretDetail(apiHandler.client, namespace, name)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get secrets list API call.
func (apiHandler *APIHandler) handleGetSecretList(request *restful.Request, response *restful.Response) {
	dataSelect := parseDataSelectPathParameter(request)
	namespace := parseNamespacePathParameter(request)
	result, err := secret.GetSecretList(apiHandler.client, namespace, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetConfigMapList(request *restful.Request, response *restful.Response) {
	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := configmap.GetConfigMapList(apiHandler.client, namespace, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetConfigMapDetail(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("configmap")
	result, err := configmap.GetConfigMapDetail(apiHandler.client, namespace, name)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

func (apiHandler *APIHandler) handleGetPersistentVolumeList(request *restful.Request, response *restful.Response) {
	pagination := parsePaginationPathParameter(request)
	result, err := persistentvolume.GetPersistentVolumeList(apiHandler.client, pagination)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetPersistentVolumeDetail(request *restful.Request, response *restful.Response) {
	name := request.PathParameter("persistentvolume")
	result, err := persistentvolume.GetPersistentVolumeDetail(apiHandler.client, name)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles log API call.
func (apiHandler *APIHandler) handleLogs(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	podID := request.PathParameter("pod")
	containerID := request.PathParameter("container")

	result, err := container.GetPodLogs(apiHandler.client, namespace, podID, containerID)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

func (apiHandler *APIHandler) handleGetPodContainers(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	podID := request.PathParameter("pod")

	result, err := container.GetPodContainers(apiHandler.client, namespace, podID)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get replication controller events API call.
func (apiHandler *APIHandler) handleGetReplicationControllerEvents(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	replicationController := request.PathParameter("replicationController")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := replicationcontroller.GetReplicationControllerEvents(apiHandler.client, dataSelect, namespace,
		replicationController)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get replication controller services API call.
func (apiHandler *APIHandler) handleGetReplicationControllerServices(request *restful.Request,
	response *restful.Response) {
	namespace := request.PathParameter("namespace")
	replicationController := request.PathParameter("replicationController")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := replicationcontroller.GetReplicationControllerServices(apiHandler.client, dataSelect,
		namespace, replicationController)
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

// Handles get Daemon Set list API call.
func (apiHandler *APIHandler) handleGetDaemonSetList(
	request *restful.Request, response *restful.Response) {

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := daemonset.GetDaemonSetList(apiHandler.client, namespace, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Daemon Set detail API call.
func (apiHandler *APIHandler) handleGetDaemonSetDetail(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	daemonSet := request.PathParameter("daemonSet")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := daemonset.GetDaemonSetDetail(apiHandler.client, apiHandler.heapsterClient,
		dataSelect, namespace, daemonSet)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Daemon Set pods API call.
func (apiHandler *APIHandler) handleGetDaemonSetPods(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	daemonSet := request.PathParameter("daemonSet")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := daemonset.GetDaemonSetPods(apiHandler.client, apiHandler.heapsterClient,
		dataSelect, daemonSet, namespace)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Daemon Set services API call.
func (apiHandler *APIHandler) handleGetDaemonSetServices(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	daemonSet := request.PathParameter("daemonSet")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := daemonset.GetDaemonSetServices(apiHandler.client, dataSelect, namespace,
		daemonSet)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles delete Daemon Set API call.
func (apiHandler *APIHandler) handleDeleteDaemonSet(
	request *restful.Request, response *restful.Response) {

	namespace := request.PathParameter("namespace")
	daemonSet := request.PathParameter("daemonSet")
	deleteServices, err := strconv.ParseBool(request.QueryParameter("deleteServices"))
	if err != nil {
		handleInternalError(response, err)
		return
	}

	if err := daemonset.DeleteDaemonSet(apiHandler.client, namespace,
		daemonSet, deleteServices); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusOK)
}

// Handles get Jobs list API call.
func (apiHandler *APIHandler) handleGetJobList(request *restful.Request,
	response *restful.Response) {
	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)

	result, err := job.GetJobList(apiHandler.client, namespace, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

func (apiHandler *APIHandler) handleGetJobDetail(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	jobParam := request.PathParameter("job")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := job.GetJobDetail(apiHandler.client, apiHandler.heapsterClient, namespace,
		jobParam, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Job pods API call.
func (apiHandler *APIHandler) handleGetJobPods(request *restful.Request,
	response *restful.Response) {

	namespace := request.PathParameter("namespace")
	jobParam := request.PathParameter("job")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := job.GetJobPods(apiHandler.client, apiHandler.heapsterClient, dataSelect,
		jobParam, namespace)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// parseNamespacePathParameter parses namespace selector for list pages in path paramater.
// The namespace selector is a comma separated list of namespaces that are trimmed.
// No namespaces means "view all user namespaces", i.e., everything except kube-system.
func parseNamespacePathParameter(request *restful.Request) *common.NamespaceQuery {
	namespace := request.PathParameter("namespace")
	namespaces := strings.Split(namespace, ",")
	var nonEmptyNamespaces []string
	for _, n := range namespaces {
		n = strings.Trim(n, " ")
		if len(n) > 0 {
			nonEmptyNamespaces = append(nonEmptyNamespaces, n)
		}
	}
	return common.NewNamespaceQuery(nonEmptyNamespaces)
}

func parsePaginationPathParameter(request *restful.Request) *common.PaginationQuery {
	itemsPerPage, err := strconv.ParseInt(request.QueryParameter("itemsPerPage"), 10, 0)
	if err != nil {
		return common.NoPagination
	}

	page, err := strconv.ParseInt(request.QueryParameter("page"), 10, 0)
	if err != nil {
		return common.NoPagination
	}

	// Frontend pages start from 1 and backend starts from 0
	return common.NewPaginationQuery(int(itemsPerPage), int(page-1))
}

// Parses query parameters of the request and returns a SortQuery object
func parseSortPathParameter(request *restful.Request) *common.SortQuery {
	return common.NewSortQuery(strings.Split(request.QueryParameter("sortby"), ","))

}

// Parses query parameters of the request and returns a DataSelectQuery object
func parseDataSelectPathParameter(request *restful.Request) *common.DataSelectQuery {
	paginationQuery := parsePaginationPathParameter(request)
	sortQuery := parseSortPathParameter(request)
	return common.NewDataSelect(paginationQuery, sortQuery)
}