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

	"k8s.io/klog/v2"

	_ "modernc.org/sqlite"

	"k8s.io/dashboard/metrics-scraper/pkg/api"
	"k8s.io/dashboard/metrics-scraper/pkg/args"
	"k8s.io/dashboard/metrics-scraper/pkg/database"
	"k8s.io/dashboard/metrics-scraper/pkg/environment"

	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/metrics/pkg/apis/metrics/v1beta1"
	metricsclient "k8s.io/metrics/pkg/client/clientset/versioned"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	klog.InfoS("Starting Metrics Scraper", "version", environment.Version)

	// This should only be run in-cluster so...
	config, err := clientcmd.BuildConfigFromFlags("", args.KubeconfigPath())
	if err != nil {
		klog.Fatalf("Unable to generate a client config: %s", err)
	}

	klog.Infof("Kubernetes host: %s", config.Host)
	klog.Infof("Namespace(s): %s", args.MetricNamespaces())

	// Generate the metrics client
	clientset, err := metricsclient.NewForConfig(config)
	if err != nil {
		klog.Fatalf("Unable to generate a clientset: %s", err)
	}

	// Create the db "connection"
	db, err := sql.Open("sqlite", args.DBFile())
	if err != nil {
		klog.Fatalf("Unable to open Sqlite database: %s", err)
	}
	defer db.Close()

	// Populate tables
	err = database.CreateDatabase(db)
	if err != nil {
		klog.Fatalf("Unable to initialize database tables: %s", err)
	}

	go func() {
		r := mux.NewRouter()

		api.Manager(r, db)
		// Bind to a port and pass our router in
		klog.Fatal(http.ListenAndServe(":8000", handlers.CombinedLoggingHandler(os.Stdout, r)))
	}()

	// Start the machine. Scrape every metricResolution
	ticker := time.NewTicker(args.MetricResolution())
	quit := make(chan struct{})

	for {
		select {
		case <-quit:
			ticker.Stop()
			return

		case <-ticker.C:
			err = update(clientset, db, args.MetricDuration(), args.MetricNamespaces())
			if err != nil {
				break
			}
		}
	}
}

/**
* Update the Node and Pod metrics in the provided DB
 */
func update(client *metricsclient.Clientset, db *sql.DB, metricDuration time.Duration, metricNamespaces []string) error {
	nodeMetrics := &v1beta1.NodeMetricsList{}
	podMetrics := &v1beta1.PodMetricsList{}
	ctx := context.TODO()
	var err error

	// If no namespace is provided, make a call to the Node
	if len(metricNamespaces) == 1 && (metricNamespaces)[0] == "" {
		// List node metrics across the cluster
		nodeMetrics, err = client.MetricsV1beta1().NodeMetricses().List(ctx, v1.ListOptions{})
		if err != nil {
			klog.Errorf("Error scraping node metrics: %s", err)
			return err
		}
	}

	// List pod metrics across the cluster, or for a given namespace
	for _, namespace := range metricNamespaces {
		pod, err := client.MetricsV1beta1().PodMetricses(namespace).List(ctx, v1.ListOptions{})
		if err != nil {
			klog.Errorf("Error scraping '%s' for pod metrics: %s", namespace, err)
			return err
		}
		podMetrics.TypeMeta = pod.TypeMeta
		podMetrics.ListMeta = pod.ListMeta
		podMetrics.Items = append(podMetrics.Items, pod.Items...)
	}

	// Insert scrapes into DB
	err = database.UpdateDatabase(db, nodeMetrics, podMetrics)
	if err != nil {
		klog.Errorf("Error updating database: %s", err)
		return err
	}

	// Delete rows outside of the metricDuration time
	err = database.CullDatabase(db, metricDuration)
	if err != nil {
		klog.Errorf("Error culling database: %s", err)
		return err
	}

	klog.Infof("Database updated: %d nodes, %d pods", len(nodeMetrics.Items), len(podMetrics.Items))
	return nil
}
