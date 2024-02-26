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

	"k8s.io/dashboard/web/pkg/router"
)

const (
	TemplateName = "appConfig"
	Template     = "{{.}}"
)

// AppConfig represents global configuration of application.
type AppConfig struct {
	ServerTime int64 `json:"serverTime"`
}

func init() {
	router.Root().GET("/config", handleGetConfig)
}

func handleGetConfig(c *gin.Context) {
	config := &AppConfig{
		ServerTime: time.Now().UTC().UnixNano() / 1e6,
	}

	//configTemplate, err := template.New(TemplateName).Parse(Template)
	//if err != nil {
	//	c.JSON(http.StatusInternalServerError, err)
	//	return
	//}
	//
	//jsonConfig, err := json.Marshal(config)
	//if err != nil {
	//	c.JSON(http.StatusInternalServerError, err)
	//	return
	//}

	//err = configTemplate.Execute(c.Writer, jsonConfig)
	//if err != nil {
	//	c.JSON(http.StatusInternalServerError, err)
	//}
	// TODO: check why it was templated
	c.JSON(http.StatusOK, config)
}
