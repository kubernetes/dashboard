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

	"k8s.io/dashboard/auth/pkg/router"
)

func init() {
	router.V1().GET("/me", handleMe)
}

func handleMe(c *gin.Context) {
	response, code, err := me(c.Request)
	if err != nil {
		klog.ErrorS(err, "Could not get user")
		c.JSON(code, err)
		return
	}

	c.JSON(http.StatusOK, response)
}
