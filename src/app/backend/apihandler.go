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
	"io"
	"net/http"

	restful "github.com/emicklei/go-restful"
)

// Creates a new HTTP handler that handles all requests to the API of the backend.
func createApiHandler() http.Handler {
	wsContainer := restful.NewContainer()

	// TODO(bryk): This is for tests only. Replace with real implementation once ready.
	ws := new(restful.WebService)
	ws.Path("/api/test").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	ws.Route(ws.GET("").To(func(req *restful.Request, resp *restful.Response) {
		io.WriteString(resp, "Hello world")
	}))

	wsContainer.Add(ws)

	return wsContainer
}
