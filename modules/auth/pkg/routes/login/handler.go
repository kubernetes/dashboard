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

package login

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"k8s.io/klog/v2"

	v1 "k8s.io/dashboard/auth/api/v1"
	"k8s.io/dashboard/auth/pkg/router"
)

func init() {
	router.V1().POST("/login", handleLogin)
}

func handleLogin(c *gin.Context) {
	loginRequest := new(v1.LoginRequest)
	err := c.Bind(loginRequest)
	if err != nil {
		klog.ErrorS(err, "Could not read login request")
		c.JSON(http.StatusBadRequest, err)
		return
	}

	response, code, err := login(loginRequest, c.Request)
	if err != nil {
		klog.ErrorS(err, "Could not log in")
		c.JSON(code, err)
		return
	}

	c.JSON(code, response)
}
