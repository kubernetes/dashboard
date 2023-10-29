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

package main

import (
	"context"
	"database/sql"
	"net/http"
	"os"
	"time"

	log "github.com/sirupsen/logrus"
	flag "github.com/spf13/pflag"

	_ "github.com/mattn/go-sqlite3"

	"k8s.io/dashboard/metrics-scraper/pkg/api"
	"k8s.io/dashboard/metrics-scraper/pkg/database"

	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/metrics/pkg/apis/metrics/v1beta1"
	metricsclient "k8s.io/metrics/pkg/client/clientset/versioned"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	var kubeconfig *string
	var dbFile *string
	var metricResolution *time.Duration
	var metricDuration *time.Duration
	var logLevel *string
	var logToStdErr *bool
	var metricNamespace *[]string

	log.SetFormatter(&log.JSONFormatter{})

	// Output to stdout instead of the default stderr
	// Can be any io.Writer, see below for File example
	log.SetOutput(os.Stdout)

	// Only log the warning severity or above.
	log.SetLevel(log.InfoLevel)

	kubeconfig = flag.String("kubeconfig", "", "The path to the kubeconfig used to connect to the Kubernetes API server and the Kubelets (defaults to in-cluster config)")
	dbFile = flag.String("db-file", "/tmp/metrics.db", "What file to use as a SQLite3 database.")
	metricResolution = flag.Duration("metric-resolution", 1*time.Minute, "The resolution at which dashboard-metrics-scraper will poll metrics.")
	metricDuration = flag.Duration("metric-duration", 15*time.Minute, "The duration after which metrics are purged from the database.")
	logLevel = flag.String("log-level", "info", "The log level")
	logToStdErr = flag.Bool("logtostderr", true, "Log to stderr")
	// When running in a scoped namespace, disable Node lookup and only capture metrics for the given namespace(s)
	metricNamespace = flag.StringSliceP("namespace", "n", []string{getEnv("POD_NAMESPACE", "")}, "The namespace to use for all metric calls. When provided, skip node metrics. (defaults to cluster level metrics)")

	flag.Parse()

	if *logToStdErr {
		log.SetOutput(os.Stderr)
	}

	level, err := log.ParseLevel(*logLevel)
	if err != nil {
		log.Fatal(err)
	} else {
		log.SetLevel(level)
	}

	// This should only be run in-cluster so...
	config, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
	if err != nil {
		log.Fatalf("Unable to generate a client config: %s", err)
	}

	log.Infof("Kubernetes host: %s", config.Host)
	log.Infof("Namespace(s): %s", *metricNamespace)

	// Generate the metrics client
	clientset, err := metricsclient.NewForConfig(config)
	if err != nil {
		log.Fatalf("Unable to generate a clientset: %s", err)
	}

	// Create the db "connection"
	db, err := sql.Open("sqlite3", *dbFile)
	if err != nil {
		log.Fatalf("Unable to open Sqlite database: %s", err)
	}
	defer db.Close()

	// Populate tables
	err = database.CreateDatabase(db)
	if err != nil {
		log.Fatalf("Unable to initialize database tables: %s", err)
	}

	go func() {
		r := mux.NewRouter()

		api.Manager(r, db)
		// Bind to a port and pass our router in
		log.Fatal(http.ListenAndServe(":8000", handlers.CombinedLoggingHandler(os.Stdout, r)))
	}()

	// Start the machine. Scrape every metricResolution
	ticker := time.NewTicker(*metricResolution)
	quit := make(chan struct{})

	for {
		select {
		case <-quit:
			ticker.Stop()
			return

		case <-ticker.C:
			err = update(clientset, db, metricDuration, metricNamespace)
			if err != nil {
				break
			}
		}
	}
}

/**
* Update the Node and Pod metrics in the provided DB
 */
func update(client *metricsclient.Clientset, db *sql.DB, metricDuration *time.Duration, metricNamespace *[]string) error {
	nodeMetrics := &v1beta1.NodeMetricsList{}
	podMetrics := &v1beta1.PodMetricsList{}
	ctx := context.TODO()
	var err error

	// If no namespace is provided, make a call to the Node
	if len(*metricNamespace) == 1 && (*metricNamespace)[0] == "" {
		// List node metrics across the cluster
		nodeMetrics, err = client.MetricsV1beta1().NodeMetricses().List(ctx, v1.ListOptions{})
		if err != nil {
			log.Errorf("Error scraping node metrics: %s", err)
			return err
		}
	}

	// List pod metrics across the cluster, or for a given namespace
	for _, namespace := range *metricNamespace {
		pod, err := client.MetricsV1beta1().PodMetricses(namespace).List(ctx, v1.ListOptions{})
		if err != nil {
			log.Errorf("Error scraping '%s' for pod metrics: %s", namespace, err)
			return err
		}
		podMetrics.TypeMeta = pod.TypeMeta
		podMetrics.ListMeta = pod.ListMeta
		podMetrics.Items = append(podMetrics.Items, pod.Items...)
	}

	// Insert scrapes into DB
	err = database.UpdateDatabase(db, nodeMetrics, podMetrics)
	if err != nil {
		log.Errorf("Error updating database: %s", err)
		return err
	}

	// Delete rows outside of the metricDuration time
	err = database.CullDatabase(db, metricDuration)
	if err != nil {
		log.Errorf("Error culling database: %s", err)
		return err
	}

	log.Infof("Database updated: %d nodes, %d pods", len(nodeMetrics.Items), len(podMetrics.Items))
	return nil
}

/**
* Lookup the environment variable provided and set to default value if variable isn't found
 */
func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		value = fallback
	}
	return value
}
