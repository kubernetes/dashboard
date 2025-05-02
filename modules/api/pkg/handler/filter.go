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
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/emicklei/go-restful/v3"
	utilnet "k8s.io/apimachinery/pkg/util/net"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/api/pkg/args"
	"k8s.io/dashboard/csrf"
	"k8s.io/dashboard/helpers"
)

const (
	originalForwardedForHeader = "X-Original-Forwarded-For"
	forwardedForHeader         = "X-Forwarded-For"
	realIPHeader               = "X-Real-Ip"
)

// InstallFilters installs defined filter for given web service
func InstallFilters(ws *restful.WebService) {
	ws.Filter(requestAndResponseLogger)
	ws.Filter(metricsFilter)
	ws.Filter(csrf.GoRestful().CSRF(
		csrf.GoRestful().WithCSRFActionGetter(helpers.GetResourceFromPath),
		csrf.GoRestful().WithCSRFRunCondition(shouldDoCsrfValidation),
	))
}

// web-service filter function used for request and response logging.
func requestAndResponseLogger(request *restful.Request, response *restful.Response,
	chain *restful.FilterChain) {
	klog.V(args.LogLevelVerbose).Info(formatRequestLog(request))
	chain.ProcessFilter(request, response)
	klog.V(args.LogLevelVerbose).Info(formatResponseLog(response, request))
}

// formatRequestLog formats request log string.
func formatRequestLog(request *restful.Request) string {
	uri := ""
	content := "{}"

	if request.Request.URL != nil {
		uri = request.Request.URL.RequestURI()
	}

	byteArr, err := io.ReadAll(request.Request.Body)
	if err == nil {
		content = string(byteArr)
	}

	// Restore request body so we can read it again in regular request handlers
	request.Request.Body = io.NopCloser(bytes.NewReader(byteArr))

	// Hide sensitive url content for log level lower than debug
	if args.APILogLevel() < args.LogLevelDebug && checkSensitiveURL(&uri) {
		content = "{ content hidden }"
	}

	return fmt.Sprintf(
		RequestLogString,
		request.Request.Proto,
		request.Request.Method,
		uri,
		getRemoteAddr(request.Request),
		content,
	)
}

// formatResponseLog formats response log string.
func formatResponseLog(response *restful.Response, request *restful.Request) string {
	return fmt.Sprintf(
		ResponseLogString,
		getRemoteAddr(request.Request),
		response.StatusCode(),
	)
}

// checkSensitiveUrl checks if a string matches against a sensitive URL
// true if sensitive. false if not.
func checkSensitiveURL(url *string) bool {
	var s struct{}
	var sensitiveUrls = make(map[string]struct{})
	sensitiveUrls["/api/v1/login"] = s
	sensitiveUrls["/api/v1/csrftoken/login"] = s

	_, ok := sensitiveUrls[*url]
	return ok
}

func metricsFilter(req *restful.Request, resp *restful.Response,
	chain *restful.FilterChain) {
	resource := helpers.GetResourceFromPath(req.SelectedRoutePath())
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

// Post requests should set correct X-CSRF-TOKEN header, all other requests
// should either not edit anything or be already safe to CSRF attacks (PUT
// and DELETE)
func shouldDoCsrfValidation(req *restful.Request) bool {
	if !args.IsCSRFProtectionEnabled() {
		return false
	}

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

// getRemoteAddr extracts the remote address of the request, taking into
// account proxy headers.
func getRemoteAddr(r *http.Request) string {
	// Hide sensitive content for log level lower than debug
	if args.APILogLevel() < args.LogLevelDebug {
		return "{ content hidden }"
	}

	if ip := getRemoteIPFromForwardHeader(r, originalForwardedForHeader); ip != "" {
		return ip
	}

	if ip := getRemoteIPFromForwardHeader(r, forwardedForHeader); ip != "" {
		return ip
	}

	if realIP := strings.TrimSpace(r.Header.Get(realIPHeader)); realIP != "" {
		return realIP
	}

	return r.RemoteAddr
}

func getRemoteIPFromForwardHeader(r *http.Request, header string) string {
	ips := strings.Split(r.Header.Get(header), ",")
	return strings.TrimSpace(ips[0])
}
