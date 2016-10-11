package chart

import (
	"fmt"
	"log"

	"k8s.io/helm/cmd/helm/helmpath"
	"k8s.io/helm/pkg/helm"
)

// AppDeploymentFromChartSpec is a specification for a chart deployment.
type AppDeploymentFromChartSpec struct {
	// URL of the chart.
	ChartURL string `json:"chartURL"`

	// Name of the release.
	ReleaseName string `json:"releaseName"`

	// Namespace for release.
	Namespace string `json:"namespace"`
}

// AppDeploymentFromChartResponse is a specification for a chart deployment.
type AppDeploymentFromChartResponse struct {
	// URL of the chart.
	ChartURL string `json:"chartURL"`

	// Name of the release.
	ReleaseName string `json:"releaseName"`

	// Namespace for release.
	Namespace string `json:"namespace"`

	// Error after deploying chart
	Error string `json:"error"`
}

// DeployChart deploys an chart based on the given configuration.
func DeployChart(spec *AppDeploymentFromChartSpec, helmClient *helm.Client) error {
	log.Printf("Deploying chart %s with release name %s", spec.ChartURL, spec.ReleaseName)

	if err := ensureHome(helmpath.Home(homePath())); err != nil {
		log.Printf("No helm home setup: %s", err)
		return err
	}

	chartPath, err := locateChartPath(spec.ChartURL, "", false, "")
	if err != nil {
		log.Printf("Failed to find chart: %s", err)
		return err
	}
	log.Printf("chartPath is: %q", chartPath)
	log.Printf("namespace is: %q", spec.Namespace)

	if helmClient == nil {
		return fmt.Errorf("No helm client available to deploy chart.")
	}

	res, err := helmClient.InstallRelease(
		chartPath,
		spec.Namespace,
		helm.ValueOverrides(nil),
		helm.ReleaseName(spec.ReleaseName),
		helm.InstallDryRun(false),
		helm.InstallReuseName(false),
		helm.InstallDisableHooks(false),
	)
	if err != nil {
		log.Printf("Error installing release: %s", err)
		return err
	}
	log.Printf("Release response: %s", res)
	return nil
}
