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

package api

import (
	"database/sql"
	"fmt"
	"html"
	"net/http"

	"github.com/gorilla/mux"
	"k8s.io/klog/v2"
	_ "modernc.org/sqlite"

	dashboardProvider "k8s.io/dashboard/metrics-scraper/pkg/api/dashboard"
)

// Manager provides a handler for all api calls
func Manager(r *mux.Router, db *sql.DB) {
	dashboardRouter := r.PathPrefix("/api/v1/dashboard").Subrouter()
	dashboardProvider.DashboardRouter(dashboardRouter, db)
	r.PathPrefix("/").HandlerFunc(DefaultHandler)
}

// DefaultHandler provides a handler for all http calls
func DefaultHandler(w http.ResponseWriter, r *http.Request) {
	msg := fmt.Sprintf("URL: %s", html.EscapeString(r.URL.String()))
	_, err := w.Write([]byte(msg))
	if err != nil {
		klog.Errorf("Error cannot write response: %v", err)
	}
}
