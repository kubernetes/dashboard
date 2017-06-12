package api

import "k8s.io/apimachinery/pkg/apis/meta/v1"

// IntegrationID is a unique identification string that every integrated app has to provide.
type IntegrationID string

// Integration represents application integrated into the dashboard. Every application
// has to provide health check and id. Additionally every client supported by integration manager
// has to implement this interface
type Integration interface {
	HealthCheck() error
	ID() IntegrationID
}

// IntegrationState represents integration application state. Provides information about
// health (if dashboard can connect to it) of the integrated application.
// TODO(floreks): Support more information like 'installed' and 'enabled'.
type IntegrationState struct {
	Connected   bool    `json:"connected"`
	LastChecked v1.Time `json:"lastChecked"`
	Error       error   `json:"error"`
}
