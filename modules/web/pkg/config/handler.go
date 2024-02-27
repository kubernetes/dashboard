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

package config

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"k8s.io/dashboard/web/pkg/environment"

	"k8s.io/dashboard/web/pkg/router"
)

func init() {
	router.Root().GET("/config", handleGetConfig)
}

func handleGetConfig(c *gin.Context) {
	c.JSON(http.StatusOK, &Config{
		ServerTime: time.Now().UTC().UnixNano() / 1e6,
		UserAgent:  environment.UserAgent(),
		Version:    environment.Version,
	})
}
