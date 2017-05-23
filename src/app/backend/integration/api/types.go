package api

import "k8s.io/apimachinery/pkg/apis/meta/v1"

type IntegrationID string

// Every client supported by integration manager should implement this interface
type Integration interface {
	HealthCheck() error
	ID() IntegrationID
}

type IntegrationState struct {
	//Installed   bool         `json:"installed"`
	//Enabled     bool         `json:"enabled"`
	Connected   bool    `json:"connected"`
	LastChecked v1.Time `json:"lastChecked"`
	Error       error   `json:"error"`
}
