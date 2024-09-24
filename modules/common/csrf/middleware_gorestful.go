// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package csrf

import (
	"net/http"

	"github.com/emicklei/go-restful/v3"
	"golang.org/x/net/xsrftoken"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/errors"
)

var (
	goRestfulPassThroughMiddleware = func(req *restful.Request, resp *restful.Response, chain *restful.FilterChain) {
		chain.ProcessFilter(req, resp)
	}

	goRestful = &GoRestfulMiddlewares{}
)

func GoRestful() *GoRestfulMiddlewares {
	return goRestful
}

type GoRestfulMiddlewares struct{}

func (in *GoRestfulMiddlewares) CSRF(options ...GoRestfulCSRFOption) restful.FilterFunction {
	middleware := &GoRestfulCSRFMiddleware{}

	for _, opt := range options {
		opt(middleware)
	}

	return middleware.build()
}

func (in *GoRestfulMiddlewares) WithCSRFActionGetter(getter GoRestfulCSRFActionGetter) GoRestfulCSRFOption {
	return func(middleware *GoRestfulCSRFMiddleware) {
		middleware.actionGetter = getter
	}
}

func (in *GoRestfulMiddlewares) WithCSRFRunCondition(condition GoRestfulCSRFRunCondition) GoRestfulCSRFOption {
	return func(middleware *GoRestfulCSRFMiddleware) {
		middleware.runCondition = condition
	}
}

type GoRestfulCSRFOption func(middleware *GoRestfulCSRFMiddleware)
type GoRestfulCSRFActionGetter func(selectedRoutePath string) (action *string)
type GoRestfulCSRFRunCondition func(request *restful.Request) bool

type GoRestfulCSRFMiddleware struct {
	actionGetter GoRestfulCSRFActionGetter
	runCondition GoRestfulCSRFRunCondition
}

func (in *GoRestfulCSRFMiddleware) build() restful.FilterFunction {
	if in.actionGetter == nil || in.runCondition == nil {
		klog.Errorf("Could not create go-restful CSRF middleware. Required options are missing.")
		return goRestfulPassThroughMiddleware
	}

	return func(req *restful.Request, resp *restful.Response, chain *restful.FilterChain) {
		actionID := in.actionGetter(req.SelectedRoutePath())

		if !in.runCondition(req) {
			chain.ProcessFilter(req, resp)
			return
		}

		klog.V(4).InfoS("[GinCSRFMiddleware] Got request", "path", req.SelectedRoutePath(), "actionID", actionID)
		if actionID == nil || !xsrftoken.Valid(req.HeaderParameter(csrfTokenHeader), Key(), "none", *actionID) {
			klog.Errorf("CSRF validation failed, actionID: %s", *actionID)

			resp.AddHeader("Content-Type", "text/plain")
			_ = resp.WriteError(http.StatusUnauthorized, errors.NewCSRFValidationFailed())
			return
		}

		chain.ProcessFilter(req, resp)
	}
}
