// Copyright 2016 Google Inc. All Rights Reserved.
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

package gce

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"time"

	"cloud.google.com/go/compute/metadata"
	"github.com/golang/glog"
)

const (
	waitForGCEInterval = 5 * time.Second
	waitForGCETimeout  = 3 * time.Minute
	gcpCredentialsEnv  = "GOOGLE_APPLICATION_CREDENTIALS"
	gcpProjectIdEnv    = "GOOGLE_PROJECT_ID"
)

func EnsureOnGCE() error {
	for start := time.Now(); time.Since(start) < waitForGCETimeout; time.Sleep(waitForGCEInterval) {
		glog.Infof("Waiting for GCE metadata to be available")
		if metadata.OnGCE() {
			return nil
		}
	}
	return fmt.Errorf("not running on GCE")
}

func GetProjectId() (string, error) {
	// Try the environment variable first.
	if projectId, err := getProjectIdFromEnv(); err != nil {
		glog.V(4).Infof("Unable to get GCP project ID from environment variable: %v", err)
	} else {
		return projectId, nil
	}

	// Try the default credentials file.
	if projectId, err := getProjectIdFromFile(); err != nil {
		glog.V(4).Infof("Unable to get GCP project ID from default credentials file: %v", err)
	} else {
		return projectId, nil
	}

	// Finally, fallback on the metadata service.
	projectId, err := getProjectIdFromMeta()
	if err != nil {
		return "", fmt.Errorf("unable to get GCP project ID: %v", err)
	}
	return projectId, nil
}

func getProjectIdFromEnv() (string, error) {
	projectId, set := os.LookupEnv(gcpProjectIdEnv)
	if set != true {
		return "", fmt.Errorf("environment variable %s not found", gcpProjectIdEnv)
	}
	return projectId, nil
}

func getProjectIdFromFile() (string, error) {
	file, set := os.LookupEnv(gcpCredentialsEnv)
	if set != true {
		return "", fmt.Errorf("environment variable %s not found", gcpCredentialsEnv)
	}
	conf, err := ioutil.ReadFile(file)
	if err != nil {
		return "", err
	}
	var gcpConfig struct {
		ProjectId *string `json:"project_id"`
	}
	err = json.Unmarshal(conf, &gcpConfig)
	if err != nil {
		return "", err
	}
	if gcpConfig.ProjectId == nil {
		return "", fmt.Errorf("field project_id not found")
	}
	return *gcpConfig.ProjectId, nil
}

func getProjectIdFromMeta() (string, error) {
	if err := EnsureOnGCE(); err != nil {
		return "", err
	}
	projectId, err := metadata.ProjectID()
	if err != nil {
		return "", err
	}
	return projectId, nil
}
