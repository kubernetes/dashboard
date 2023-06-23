package api

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	dashboardProvider "github.com/kubernetes-sigs/dashboard-metrics-scraper/pkg/api/dashboard"
	_ "github.com/mattn/go-sqlite3"
	log "github.com/sirupsen/logrus"
)

// Manager provides a handler for all api calls
func Manager(r *mux.Router, db *sql.DB) {
	dashboardRouter := r.PathPrefix("/api/v1/dashboard").Subrouter()
	dashboardProvider.DashboardRouter(dashboardRouter, db)
	r.PathPrefix("/").HandlerFunc(DefaultHandler)
}

// DefaultHandler provides a handler for all http calls
func DefaultHandler(w http.ResponseWriter, r *http.Request) {
	msg := fmt.Sprintf("URL: %s", r.URL)
	_, err := w.Write([]byte(msg))
	if err != nil {
		log.Errorf("Error cannot write response: %v", err)
	}
}
