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
	"log"
	"net/http"
	"text/template"
	"time"
)

// AppHandler is an application handler.
type AppHandler func(http.ResponseWriter, *http.Request) (int, error)

// AppConfig is a global configuration of application.
type AppConfig struct {
	// ServerTime is current server time.
	ServerTime int64 `json:"serverTime"`
}

const (
	// ConfigTemplateName is a name of config template
	ConfigTemplateName = "appConfig"
	// ConfigTemplate is a template of a config
	ConfigTemplate = "{{.}}"
)

// ServeHTTP serves HTTP endpoint with application configuration.
func (fn AppHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if _, err := fn(w, r); err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
	}
}

func getAppConfigJSON() string {
	log.Println("Getting application global configuration")

	config := &AppConfig{
		ServerTime: time.Now().UTC().UnixNano() / 1e6,
	}

	jsonConfig, _ := json.Marshal(config)
	log.Printf("Application configuration %s", jsonConfig)
	return string(jsonConfig)
}

func ConfigHandler(w http.ResponseWriter, r *http.Request) (int, error) {
	configTemplate, err := template.New(ConfigTemplateName).Parse(ConfigTemplate)
	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		return http.StatusInternalServerError, err
	}
	return http.StatusOK, configTemplate.Execute(w, getAppConfigJSON())
}
