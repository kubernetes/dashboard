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
	"crypto/rand"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	restful "github.com/emicklei/go-restful"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/admin"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/config"
	"github.com/kubernetes/dashboard/src/app/backend/resource/configmap"
	"github.com/kubernetes/dashboard/src/app/backend/resource/container"
	"github.com/kubernetes/dashboard/src/app/backend/resource/daemonset/daemonsetdetail"
	"github.com/kubernetes/dashboard/src/app/backend/resource/daemonset/daemonsetlist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/deployment"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/horizontalpodautoscaler/horizontalpodautoscalerdetail"
	"github.com/kubernetes/dashboard/src/app/backend/resource/horizontalpodautoscaler/horizontalpodautoscalerlist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/ingress"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job/jobdetail"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job/joblist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/logs"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/namespace"
	"github.com/kubernetes/dashboard/src/app/backend/resource/node"
	"github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolume"
	"github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolumeclaim"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset/replicasetdetail"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset/replicasetlist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicationcontroller/replicationcontrollerdetail"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicationcontroller/replicationcontrollerlist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/secret"
	resourceService "github.com/kubernetes/dashboard/src/app/backend/resource/service"
	"github.com/kubernetes/dashboard/src/app/backend/resource/servicesanddiscovery"
	"github.com/kubernetes/dashboard/src/app/backend/resource/statefulset/statefulsetdetail"
	"github.com/kubernetes/dashboard/src/app/backend/resource/statefulset/statefulsetlist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/workload"
	"github.com/kubernetes/dashboard/src/app/backend/validation"
	"golang.org/x/net/xsrftoken"
	clientK8s "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
	"k8s.io/kubernetes/pkg/client/restclient"
	"k8s.io/kubernetes/pkg/client/unversioned/clientcmd"
	"k8s.io/kubernetes/pkg/runtime"
	utilnet "k8s.io/kubernetes/pkg/util/net"
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
	client         *clientK8s.Clientset
	heapsterClient client.HeapsterClient
	clientConfig   clientcmd.ClientConfig
	verber         common.ResourceVerber
	csrfKey        string
}

type CsrfToken struct {
	Token string `json:"token"`
}

func wsMetrics(req *restful.Request, resp *restful.Response, chain *restful.FilterChain) {
	startTime := time.Now()
	verb := req.Request.Method
	resource := mapUrlToResource(req.SelectedRoutePath())
	client := utilnet.GetHTTPClient(req.Request)
	chain.ProcessFilter(req, resp)
	code := resp.StatusCode()
	contentType := resp.Header().Get("Content-Type")
	if resource != nil {
		Monitor(verb, *resource, client, contentType, code, startTime)
	}
}

// Post requests should set correct X-CSRF-TOKEN header, all other requests
// should either not edit anything or be already safe to CSRF attacks (PUT
// and DELETE)
func shouldDoCsrfValidation(req *restful.Request) bool {
	if req.Request.Method != "POST" {
		return false
	}
	// Validation handlers are idempotent functions, and not actual data
	// modification operations
	if strings.HasPrefix(req.SelectedRoutePath(), "/api/v1/appdeployment/validate/") {
		return false
	}
	return true
}

func xsrfValidation(csrfKey string) func(*restful.Request, *restful.Response, *restful.FilterChain) {

	return func(req *restful.Request, resp *restful.Response, chain *restful.FilterChain) {
		resource := mapUrlToResource(req.SelectedRoutePath())
		if resource == nil || (shouldDoCsrfValidation(req) &&
			!xsrftoken.Valid(req.HeaderParameter("X-CSRF-TOKEN"),
				csrfKey,
				"none",
				*resource)) {

			err := errors.New("CSRF validation failed")
			log.Print(err)
			resp.AddHeader("Content-Type", "text/plain")
			resp.WriteErrorString(http.StatusUnauthorized, err.Error()+"\n")
		} else {
			chain.ProcessFilter(req, resp)
		}
	}
}

// Extract the resource from the path
// Third part of URL (/api/v1/<resource>) and ignore potential subresources
func mapUrlToResource(url string) *string {
	parts := strings.Split(url, "/")
	if len(parts) < 3 {
		return nil
	}
	return &parts[3]
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
func CreateHTTPAPIHandler(client *clientK8s.Clientset, heapsterClient client.HeapsterClient,
	clientConfig clientcmd.ClientConfig) (http.Handler, error) {

	verber := common.NewResourceVerber(client.Core().RESTClient(),
		client.ExtensionsClient.RESTClient(), client.AppsClient.RESTClient(),
		client.BatchClient.RESTClient(), client.AutoscalingClient.RESTClient())

	var csrfKey string
	inClusterConfig, err := restclient.InClusterConfig()
	if err == nil {
		// We run in a cluster, so we should use a signing key that is the same for potential replications
		log.Printf("Using service account token for csrf signing")
		csrfKey = inClusterConfig.BearerToken
	} else {
		// Most likely running for a dev, so no replica issues, just generate a random key
		log.Printf("Using random key for csrf signing")
		bytes := make([]byte, 256)
		_, err := rand.Read(bytes)
		if err != nil {
			return nil, err
		}
		csrfKey = string(bytes)
	}

	apiHandler := APIHandler{client, heapsterClient, clientConfig, verber, csrfKey}
	wsContainer := restful.NewContainer()
	wsContainer.EnableContentEncoding(true)

	apiV1Ws := new(restful.WebService)
	apiV1Ws.Filter(wsLogger)

	RegisterMetrics()
	apiV1Ws.Filter(wsMetrics)
	apiV1Ws.Filter(xsrfValidation(csrfKey))
	apiV1Ws.Path("/api/v1").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	wsContainer.Add(apiV1Ws)

	apiV1Ws.Route(
		apiV1Ws.GET("csrftoken/{action}").
			To(apiHandler.handleGetCsrfToken).
			Writes(CsrfToken{}))

	apiV1Ws.Route(
		apiV1Ws.POST("/appdeployment").
			To(apiHandler.handleDeploy).
			Reads(deployment.AppDeploymentSpec{}).
			Writes(deployment.AppDeploymentSpec{}))
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
			Writes(deployment.Protocols{}))

	apiV1Ws.Route(
		apiV1Ws.POST("/appdeploymentfromfile").
			To(apiHandler.handleDeployFromFile).
			Reads(deployment.AppDeploymentFromFileSpec{}).
			Writes(deployment.AppDeploymentFromFileResponse{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller").
			To(apiHandler.handleGetReplicationControllerList).
			Writes(replicationcontrollerlist.ReplicationControllerList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller/{namespace}").
			To(apiHandler.handleGetReplicationControllerList).
			Writes(replicationcontrollerlist.ReplicationControllerList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller/{namespace}/{replicationController}").
			To(apiHandler.handleGetReplicationControllerDetail).
			Writes(replicationcontrollerdetail.ReplicationControllerDetail{}))
	apiV1Ws.Route(
		apiV1Ws.POST("/replicationcontroller/{namespace}/{replicationController}/update/pod").
			To(apiHandler.handleUpdateReplicasCount).
			Reads(replicationcontrollerdetail.ReplicationControllerSpec{}))
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
		apiV1Ws.GET("/admin").
			To(apiHandler.handleGetAdmin).
			Writes(admin.Admin{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/servicesanddiscovery").
			To(apiHandler.handleGetServicesAndDiscovery).
			Writes(servicesanddiscovery.ServicesAndDiscovery{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/servicesanddiscovery/{namespace}").
			To(apiHandler.handleGetServicesAndDiscovery).
			Writes(servicesanddiscovery.ServicesAndDiscovery{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/config").
			To(apiHandler.handleGetConfig).
			Writes(config.Config{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/config/{namespace}").
			To(apiHandler.handleGetConfig).
			Writes(config.Config{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset").
			To(apiHandler.handleGetReplicaSets).
			Writes(replicasetlist.ReplicaSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset/{namespace}").
			To(apiHandler.handleGetReplicaSets).
			Writes(replicasetlist.ReplicaSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset/{namespace}/{replicaSet}").
			To(apiHandler.handleGetReplicaSetDetail).
			Writes(replicasetdetail.ReplicaSetDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset/{namespace}/{replicaSet}/pod").
			To(apiHandler.handleGetReplicaSetPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset/{namespace}/{replicaSet}/event").
			To(apiHandler.handleGetReplicaSetEvents).
			Writes(common.EventList{}))

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
			Writes(logs.Logs{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/pod/{namespace}/{pod}/log/{container}").
			To(apiHandler.handleLogs).
			Writes(logs.Logs{}))

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
		apiV1Ws.GET("/deployment/{namespace}/{deployment}/event").
			To(apiHandler.handleGetDeploymentEvents).
			Writes(common.EventList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/deployment/{namespace}/{deployment}/oldreplicaset").
			To(apiHandler.handleGetDeploymentOldReplicaSets).
			Writes(replicasetlist.ReplicaSetList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset").
			To(apiHandler.handleGetDaemonSetList).
			Writes(daemonsetlist.DaemonSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}").
			To(apiHandler.handleGetDaemonSetList).
			Writes(daemonsetlist.DaemonSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}/{daemonSet}").
			To(apiHandler.handleGetDaemonSetDetail).
			Writes(daemonsetdetail.DaemonSetDetail{}))
	apiV1Ws.Route(
		apiV1Ws.DELETE("/daemonset/{namespace}/{daemonSet}").
			To(apiHandler.handleDeleteDaemonSet))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}/{daemonSet}/pod").
			To(apiHandler.handleGetDaemonSetPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}/{daemonSet}/service").
			To(apiHandler.handleGetDaemonSetServices).
			Writes(resourceService.ServiceList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}/{daemonSet}/event").
			To(apiHandler.handleGetDaemonSetEvents).
			Writes(common.EventList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/horizontalpodautoscaler").
			To(apiHandler.handleGetHorizontalPodAutoscalerList).
			Writes(horizontalpodautoscalerlist.HorizontalPodAutoscalerList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/horizontalpodautoscaler/{namespace}").
			To(apiHandler.handleGetHorizontalPodAutoscalerList).
			Writes(horizontalpodautoscalerlist.HorizontalPodAutoscalerList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/horizontalpodautoscaler/{namespace}/{horizontalpodautoscaler}").
			To(apiHandler.handleGetHorizontalPodAutoscalerDetail).
			Writes(horizontalpodautoscalerdetail.HorizontalPodAutoscalerDetail{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/job").
			To(apiHandler.handleGetJobList).
			Writes(joblist.JobList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/job/{namespace}").
			To(apiHandler.handleGetJobList).
			Writes(joblist.JobList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/job/{namespace}/{job}").
			To(apiHandler.handleGetJobDetail).
			Writes(jobdetail.JobDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/job/{namespace}/{job}/pod").
			To(apiHandler.handleGetJobPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/job/{namespace}/{job}/event").
			To(apiHandler.handleGetJobEvents).
			Writes(common.EventList{}))

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
		apiV1Ws.GET("/namespace/{name}/event").
			To(apiHandler.handleGetNamespaceEvents).
			Writes(common.EventList{}))

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
		apiV1Ws.GET("/ingress").
			To(apiHandler.handleGetIngressList).
			Writes(ingress.IngressList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/ingress/{namespace}").
			To(apiHandler.handleGetIngressList).
			Writes(ingress.IngressList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/ingress/{namespace}/{name}").
			To(apiHandler.handleGetIngressDetail).
			Writes(ingress.IngressDetail{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/statefulset").
			To(apiHandler.handleGetStatefulSetList).
			Writes(statefulsetlist.StatefulSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/statefulset/{namespace}").
			To(apiHandler.handleGetStatefulSetList).
			Writes(statefulsetlist.StatefulSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/statefulset/{namespace}/{statefulset}").
			To(apiHandler.handleGetStatefulSetDetail).
			Writes(statefulsetdetail.StatefulSetDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/statefulset/{namespace}/{statefulset}/pod").
			To(apiHandler.handleGetStatefulSetPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/statefulset/{namespace}/{statefulset}/event").
			To(apiHandler.handleGetStatefulSetEvents).
			Writes(common.EventList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/node").
			To(apiHandler.handleGetNodeList).
			Writes(node.NodeList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/node/{name}").
			To(apiHandler.handleGetNodeDetail).
			Writes(node.NodeDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/node/{name}/event").
			To(apiHandler.handleGetNodeEvents).
			Writes(common.EventList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/node/{name}/pod").
			To(apiHandler.handleGetNodePods).
			Writes(pod.PodList{}))

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
	apiV1Ws.Route(
		apiV1Ws.GET("/persistentvolume/namespace/{namespace}/name/{persistentvolume}").
			To(apiHandler.handleGetPersistentVolumeDetail).
			Writes(persistentvolume.PersistentVolumeDetail{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/persistentvolumeclaim/").
			To(apiHandler.handleGetPersistentVolumeClaimList).
			Writes(persistentvolumeclaim.PersistentVolumeClaimList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/persistentvolumeclaim/{namespace}").
			To(apiHandler.handleGetPersistentVolumeClaimList).
			Writes(persistentvolumeclaim.PersistentVolumeClaimList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/persistentvolumeclaim/{namespace}/{name}").
			To(apiHandler.handleGetPersistentVolumeClaimDetail).
			Writes(persistentvolumeclaim.PersistentVolumeClaimDetail{}))

	return wsContainer, nil
}

func (apiHandler *APIHandler) handleGetCsrfToken(request *restful.Request,
	response *restful.Response) {
	action := request.PathParameter("action")
	token := xsrftoken.Generate(apiHandler.csrfKey, "none", action)

	response.WriteHeaderAndEntity(http.StatusOK, CsrfToken{Token: token})
}

// Handles get pet set list API call.
func (apiHandler *APIHandler) handleGetStatefulSetList(request *restful.Request,
	response *restful.Response) {
	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := statefulsetlist.GetStatefulSetList(apiHandler.client, namespace, dataSelect, &apiHandler.heapsterClient)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get pet set detail API call.
func (apiHandler *APIHandler) handleGetStatefulSetDetail(request *restful.Request,
	response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("statefulset")

	result, err := statefulsetdetail.GetStatefulSetDetail(apiHandler.client, apiHandler.heapsterClient,
		namespace, name)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get pet set pods API call.
func (apiHandler *APIHandler) handleGetStatefulSetPods(request *restful.Request,
	response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("statefulset")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := statefulsetdetail.GetStatefulSetPods(apiHandler.client, apiHandler.heapsterClient,
		dataSelect, name, namespace)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get pet set events API call.
func (apiHandler *APIHandler) handleGetStatefulSetEvents(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("statefulset")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := statefulsetdetail.GetStatefulSetEvents(apiHandler.client, dataSelect, namespace,
		name)
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

func (apiHandler *APIHandler) handleGetIngressDetail(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	result, err := ingress.GetIngressDetail(apiHandler.client, namespace, name)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

func (apiHandler *APIHandler) handleGetIngressList(request *restful.Request, response *restful.Response) {
	dataSelect := parseDataSelectPathParameter(request)
	namespace := parseNamespacePathParameter(request)
	result, err := ingress.GetIngressList(apiHandler.client, namespace, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
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
	dataSelect.MetricQuery = dataselect.StandardMetrics

	result, err := node.GetNodeList(apiHandler.client, dataSelect, &apiHandler.heapsterClient)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

func (apiHandler *APIHandler) handleGetAdmin(request *restful.Request, response *restful.Response) {
	result, err := admin.GetAdmin(apiHandler.client)
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

// Handles get node events API call.
func (apiHandler *APIHandler) handleGetNodeEvents(request *restful.Request, response *restful.Response) {
	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := event.GetNodeEvents(apiHandler.client, dataSelect, name)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get node pods API call.
func (apiHandler *APIHandler) handleGetNodePods(request *restful.Request, response *restful.Response) {
	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := node.GetNodePods(apiHandler.client, apiHandler.heapsterClient, dataSelect, name)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles deploy API call.
func (apiHandler *APIHandler) handleDeploy(request *restful.Request, response *restful.Response) {
	appDeploymentSpec := new(deployment.AppDeploymentSpec)
	if err := request.ReadEntity(appDeploymentSpec); err != nil {
		handleInternalError(response, err)
		return
	}
	if err := deployment.DeployApp(appDeploymentSpec, apiHandler.client); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, appDeploymentSpec)
}

// Handles deploy from file API call.
func (apiHandler *APIHandler) handleDeployFromFile(request *restful.Request, response *restful.Response) {
	deploymentSpec := new(deployment.AppDeploymentFromFileSpec)
	if err := request.ReadEntity(deploymentSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	isDeployed, err := deployment.DeployAppFromFile(
		deploymentSpec, deployment.CreateObjectFromInfoFn, apiHandler.clientConfig)
	if !isDeployed {
		handleInternalError(response, err)
		return
	}

	errorMessage := ""
	if err != nil {
		errorMessage = err.Error()
	}

	response.WriteHeaderAndEntity(http.StatusCreated, deployment.AppDeploymentFromFileResponse{
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
	response.WriteHeaderAndEntity(http.StatusCreated, deployment.GetAvailableProtocols())
}

// Handles get Replication Controller list API call.
func (apiHandler *APIHandler) handleGetReplicationControllerList(
	request *restful.Request, response *restful.Response) {

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := replicationcontrollerlist.GetReplicationControllerList(apiHandler.client, namespace, dataSelect, &apiHandler.heapsterClient)
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
	result, err := workload.GetWorkloads(apiHandler.client, apiHandler.heapsterClient, namespace, dataselect.StandardMetrics)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

func (apiHandler *APIHandler) handleGetServicesAndDiscovery(
	request *restful.Request, response *restful.Response) {

	namespace := parseNamespacePathParameter(request)
	result, err := servicesanddiscovery.GetServicesAndDiscovery(apiHandler.client, namespace)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

func (apiHandler *APIHandler) handleGetConfig(
	request *restful.Request, response *restful.Response) {

	namespace := parseNamespacePathParameter(request)
	result, err := config.GetConfig(apiHandler.client, namespace)
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
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := replicasetlist.GetReplicaSetList(apiHandler.client, namespace, dataSelect, &apiHandler.heapsterClient)
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

	result, err := replicasetdetail.GetReplicaSetDetail(apiHandler.client, apiHandler.heapsterClient,
		namespace, replicaSet)

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
	result, err := replicasetdetail.GetReplicaSetPods(apiHandler.client, apiHandler.heapsterClient,
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
	result, err := replicasetdetail.GetReplicaSetServices(apiHandler.client, dataSelect, namespace,
		replicaSet)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get replica set events API call.
func (apiHandler *APIHandler) handleGetReplicaSetEvents(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("replicaSet")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := replicasetdetail.GetReplicaSetEvents(apiHandler.client, dataSelect, namespace,
		name)
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
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := deployment.GetDeploymentList(apiHandler.client, namespace, dataSelect, &apiHandler.heapsterClient)
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

	result, err := deployment.GetDeploymentDetail(apiHandler.client, apiHandler.heapsterClient, namespace, name)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusOK, result)
}

// Handles get deployment events API call.
func (apiHandler *APIHandler) handleGetDeploymentEvents(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("deployment")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := deployment.GetDeploymentEvents(apiHandler.client, dataSelect, namespace,
		name)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get deployment old replica sets API call.
func (apiHandler *APIHandler) handleGetDeploymentOldReplicaSets(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("deployment")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := deployment.GetDeploymentOldReplicaSets(apiHandler.client, dataSelect, namespace,
		name)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Pod list API call.
func (apiHandler *APIHandler) handleGetPods(
	request *restful.Request, response *restful.Response) {

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics // download standard metrics - cpu, and memory - by default
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

	result, err := replicationcontrollerdetail.GetReplicationControllerDetail(apiHandler.client,
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
	replicationControllerSpec := new(replicationcontrollerdetail.ReplicationControllerSpec)

	if err := request.ReadEntity(replicationControllerSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	if err := replicationcontrollerdetail.UpdateReplicasCount(apiHandler.client, namespace, replicationControllerName,
		replicationControllerSpec); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusAccepted)
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

	result, err := replicationcontrollerdetail.GetReplicationControllerPods(apiHandler.client, apiHandler.heapsterClient,
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

// Handles get namespace events API call.
func (apiHandler *APIHandler) handleGetNamespaceEvents(request *restful.Request, response *restful.Response) {
	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := event.GetNamespaceEvents(apiHandler.client, dataSelect, name)
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
	dataSelect := parseDataSelectPathParameter(request)
	result, err := persistentvolume.GetPersistentVolumeList(apiHandler.client, dataSelect)
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

func (apiHandler *APIHandler) handleGetPersistentVolumeClaimList(request *restful.Request, response *restful.Response) {

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := persistentvolumeclaim.GetPersistentVolumeClaimList(apiHandler.client, namespace, dataSelect)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetPersistentVolumeClaimDetail(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	result, err := persistentvolumeclaim.GetPersistentVolumeClaimDetail(apiHandler.client, namespace, name)
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

	refTimestamp := request.QueryParameter("referenceTimestamp")
	if refTimestamp == "" {
		refTimestamp = logs.NewestTimestamp
	}

	refLineNum, err := strconv.Atoi(request.QueryParameter("referenceLineNum"))
	if err != nil {
		refLineNum = 0
	}

	relativeFrom, err1 := strconv.Atoi(request.QueryParameter("relativeFrom"))
	relativeTo, err2 := strconv.Atoi(request.QueryParameter("relativeTo"))

	var logSelector *logs.LogViewSelector
	if err1 != nil || err2 != nil {
		logSelector = logs.DefaultLogViewSelector
	} else {

		logSelector = &logs.LogViewSelector{
			ReferenceLogLineId: logs.LogLineId{
				LogTimestamp: logs.LogTimestamp(refTimestamp),
				LineNum:      refLineNum,
			},
			RelativeFrom: relativeFrom,
			RelativeTo:   relativeTo,
		}
	}

	result, err := container.GetPodLogs(apiHandler.client, namespace, podID, containerID, logSelector)
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

	result, err := replicationcontrollerdetail.GetReplicationControllerEvents(apiHandler.client, dataSelect, namespace,
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

	result, err := replicationcontrollerdetail.GetReplicationControllerServices(apiHandler.client, dataSelect,
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
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := daemonsetlist.GetDaemonSetList(apiHandler.client, namespace, dataSelect, &apiHandler.heapsterClient)
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

	result, err := daemonsetdetail.GetDaemonSetDetail(apiHandler.client, apiHandler.heapsterClient,
		namespace, daemonSet)
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
	result, err := daemonsetdetail.GetDaemonSetPods(apiHandler.client, apiHandler.heapsterClient,
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
	result, err := daemonsetdetail.GetDaemonSetServices(apiHandler.client, dataSelect, namespace,
		daemonSet)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get daemon set events API call.
func (apiHandler *APIHandler) handleGetDaemonSetEvents(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("daemonSet")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := daemonsetdetail.GetDaemonSetEvents(apiHandler.client, dataSelect, namespace,
		name)
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

	if err := daemonsetdetail.DeleteDaemonSet(apiHandler.client, namespace,
		daemonSet, deleteServices); err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusOK)
}

// Handles get HorizontalPodAutoscalers list API call.
func (apiHandler *APIHandler) handleGetHorizontalPodAutoscalerList(request *restful.Request,
	response *restful.Response) {
	namespace := parseNamespacePathParameter(request)

	result, err := horizontalpodautoscalerlist.GetHorizontalPodAutoscalerList(apiHandler.client, namespace)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

func (apiHandler *APIHandler) handleGetHorizontalPodAutoscalerDetail(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	horizontalpodautoscalerParam := request.PathParameter("horizontalpodautoscaler")

	result, err := horizontalpodautoscalerdetail.GetHorizontalPodAutoscalerDetail(apiHandler.client, namespace, horizontalpodautoscalerParam)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get Jobs list API call.
func (apiHandler *APIHandler) handleGetJobList(request *restful.Request,
	response *restful.Response) {
	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics

	result, err := joblist.GetJobList(apiHandler.client, namespace, dataSelect, &apiHandler.heapsterClient)
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
	dataSelect.MetricQuery = dataselect.StandardMetrics

	result, err := jobdetail.GetJobDetail(apiHandler.client, apiHandler.heapsterClient, namespace, jobParam)
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

	result, err := jobdetail.GetJobPods(apiHandler.client, apiHandler.heapsterClient, dataSelect,
		namespace, jobParam)
	if err != nil {
		handleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// Handles get job events API call.
func (apiHandler *APIHandler) handleGetJobEvents(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("job")
	dataSelect := parseDataSelectPathParameter(request)

	result, err := jobdetail.GetJobEvents(apiHandler.client, dataSelect, namespace,
		name)
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

// parseNamespacePathParameter parses namespace selector for list pages in path parameter.
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

func parsePaginationPathParameter(request *restful.Request) *dataselect.PaginationQuery {
	itemsPerPage, err := strconv.ParseInt(request.QueryParameter("itemsPerPage"), 10, 0)
	if err != nil {
		return dataselect.NoPagination
	}

	page, err := strconv.ParseInt(request.QueryParameter("page"), 10, 0)
	if err != nil {
		return dataselect.NoPagination
	}

	// Frontend pages start from 1 and backend starts from 0
	return dataselect.NewPaginationQuery(int(itemsPerPage), int(page-1))
}

func parseFilterPathParameter(request *restful.Request) *dataselect.FilterQuery {
	return dataselect.NewFilterQuery(strings.Split(request.QueryParameter("filterby"), ","))
}

// Parses query parameters of the request and returns a SortQuery object
func parseSortPathParameter(request *restful.Request) *dataselect.SortQuery {
	return dataselect.NewSortQuery(strings.Split(request.QueryParameter("sortby"), ","))
}

// Parses query parameters of the request and returns a MetricQuery object
func parseMetricPathParameter(request *restful.Request) *dataselect.MetricQuery {
	metricNamesParam := request.QueryParameter("metricNames")
	var metricNames []string
	if metricNamesParam != "" {
		metricNames = strings.Split(metricNamesParam, ",")
	} else {
		metricNames = nil
	}
	aggregationsParam := request.QueryParameter("aggregations")
	var rawAggregations []string
	if aggregationsParam != "" {
		rawAggregations = strings.Split(aggregationsParam, ",")
	} else {
		rawAggregations = nil
	}
	aggregationNames := metric.AggregationNames{}
	for _, e := range rawAggregations {
		aggregationNames = append(aggregationNames, metric.AggregationName(e))
	}
	return dataselect.NewMetricQuery(metricNames, aggregationNames)

}

// Parses query parameters of the request and returns a DataSelectQuery object
func parseDataSelectPathParameter(request *restful.Request) *dataselect.DataSelectQuery {
	paginationQuery := parsePaginationPathParameter(request)
	sortQuery := parseSortPathParameter(request)
	filterQuery := parseFilterPathParameter(request)
	metricQuery := parseMetricPathParameter(request)
	return dataselect.NewDataSelectQuery(paginationQuery, sortQuery, filterQuery, metricQuery)
}
