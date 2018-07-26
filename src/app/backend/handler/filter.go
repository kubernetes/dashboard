// Copyright 2017 The Kubernetes Authors.
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
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	restful "github.com/emicklei/go-restful"
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	kdErrors "github.com/kubernetes/dashboard/src/app/backend/errors"
	"golang.org/x/net/xsrftoken"
	errorsK8s "k8s.io/apimachinery/pkg/api/errors"
	utilnet "k8s.io/apimachinery/pkg/util/net"
)

// InstallFilters installs defined filter for given web service
func InstallFilters(ws *restful.WebService, manager clientapi.ClientManager) {
	ws.Filter(requestAndResponseLogger)
	ws.Filter(metricsFilter)
	ws.Filter(validateXSRFFilter(manager.CSRFKey()))
	ws.Filter(restrictedResourcesFilter)
}

// Filter used to restrict access to dashboard exclusive resource, i.e. secret used to store dashboard encryption key.
func restrictedResourcesFilter(request *restful.Request, response *restful.Response, chain *restful.FilterChain) {
	if !authApi.ShouldRejectRequest(request.Request.URL.String()) {
		chain.ProcessFilter(request, response)
		return
	}

	err := errorsK8s.NewUnauthorized(kdErrors.MSG_DASHBOARD_EXCLUSIVE_RESOURCE_ERROR)
	response.WriteHeaderAndEntity(int(err.ErrStatus.Code), err.Error())
}

// web-service filter function used for request and response logging.
func requestAndResponseLogger(request *restful.Request, response *restful.Response,
	chain *restful.FilterChain) {
	log.Printf(formatRequestLog(request))
	chain.ProcessFilter(request, response)
	log.Printf(formatResponseLog(response, request))
}

// formatRequestLog formats request log string.
func formatRequestLog(request *restful.Request) string {
	uri := ""
	if request.Request.URL != nil {
		uri = request.Request.URL.RequestURI()
	}

	content := "{}"

	entity := make(map[string]interface{})
	request.ReadEntity(&entity)
	if len(entity) > 0 {
		bytes, err := json.MarshalIndent(entity, "", "  ")
		if err == nil {
			content = string(bytes)
		}
	}

	// Great now let's filter out any content from sensitive URLs
	var sensitive_urls [2]string
	sensitive_urls[0] = "/api/v1/login"
	sensitive_urls[1] = "/api/v1/csrftoken/login"
	for _, a := range sensitive_urls {
		if a == uri {
			content = "{ contents hidden }"
		}
	}

	return fmt.Sprintf(RequestLogString, time.Now().Format(time.RFC3339), request.Request.Proto,
		request.Request.Method, uri, request.Request.RemoteAddr, content)
}

// formatResponseLog formats response log string.
func formatResponseLog(response *restful.Response, request *restful.Request) string {
	return fmt.Sprintf(ResponseLogString, time.Now().Format(time.RFC3339),
		request.Request.RemoteAddr, response.StatusCode())
}

func metricsFilter(req *restful.Request, resp *restful.Response,
	chain *restful.FilterChain) {
	resource := mapUrlToResource(req.SelectedRoutePath())
	httpClient := utilnet.GetHTTPClient(req.Request)

	chain.ProcessFilter(req, resp)

	if resource != nil {
		monitor(
			req.Request.Method,
			*resource, httpClient,
			resp.Header().Get("Content-Type"),
			resp.StatusCode(),
			time.Now(),
		)
	}
}

func validateXSRFFilter(csrfKey string) restful.FilterFunction {
	return func(req *restful.Request, resp *restful.Response, chain *restful.FilterChain) {
		resource := mapUrlToResource(req.SelectedRoutePath())

		if resource == nil || (shouldDoCsrfValidation(req) &&
			!xsrftoken.Valid(req.HeaderParameter("X-CSRF-TOKEN"), csrfKey, "none",
				*resource)) {
			err := errors.New("CSRF validation failed")
			log.Print(err)
			resp.AddHeader("Content-Type", "text/plain")
			resp.WriteErrorString(http.StatusUnauthorized, err.Error()+"\n")
			return
		}

		chain.ProcessFilter(req, resp)
	}
}

// Post requests should set correct X-CSRF-TOKEN header, all other requests
// should either not edit anything or be already safe to CSRF attacks (PUT
// and DELETE)
func shouldDoCsrfValidation(req *restful.Request) bool {
	if req.Request.Method != http.MethodPost {
		return false
	}

	// Validation handlers are idempotent functions, and not actual data
	// modification operations
	if strings.HasPrefix(req.SelectedRoutePath(), "/api/v1/appdeployment/validate/") {
		return false
	}

	return true
}

// mapUrlToResource extracts the resource from the URL path /api/v1/<resource>.
// Ignores potential subresources.
func mapUrlToResource(url string) *string {
	parts := strings.Split(url, "/")
	if len(parts) < 3 {
		return nil
	}
	return &parts[3]
}
