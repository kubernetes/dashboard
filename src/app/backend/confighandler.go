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
	"net/http"
	"html/template"
	"log"
	"time"
)

// AppHandler is a application handler.
type AppHandler func(http.ResponseWriter, *http.Request) (int, error)

// AppConfig is a global configuration of application.
type AppConfig struct {
	// ServerTime is current server time (milliseconds elapsed since 1 January 1970 00:00:00 UTC).
	ServerTime int64
}

// ServeHTTP serves HTTP endpoint with application configuration.
func (fn AppHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if _, err := fn(w, r); err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
	}
}

func getAppConfig() *AppConfig {
	log.Printf("Getting application global configuration")

	config := &AppConfig{
		// TODO(maciaszczykm): Get time from API server instead directly from backend.
		// TODO(maciaszczykm): Time offset should be calculated to pass this value just once.
		ServerTime: time.Now().UTC().UnixNano() / 1e6,
	}

	log.Printf("Application configuration %s", config)
	return config
}

func configHandler(w http.ResponseWriter, r *http.Request) (int, error) {
	tmpl, err := template.New("test").Parse(`var appConfig = {
    		serverTime: {{.ServerTime}}
    	};`)
	if err != nil { panic(err) }
	return http.StatusOK, tmpl.Execute(w, getAppConfig())
}

