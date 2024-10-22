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

package node

import (
	"context"
	"fmt"
	"os"
	"time"

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"
	"k8s.io/kubectl/pkg/drain"

	"k8s.io/dashboard/api/pkg/args"
)

// NodeDrainSpec is a specification to control the behavior of drainer.
type NodeDrainSpec struct {
	// Defaulted to true.
	Force *bool `json:"force,omitempty"`

	// Defaulted to 2 minutes.
	Timeout *time.Duration `json:"timeout,omitempty"`

	// GracePeriodSeconds is how long to wait for a pod to terminate.
	// 0 means "delete immediately".
	// Set negative value to use pod's terminationGracePeriodSeconds.
	// Defaulted to -1.
	GracePeriodSeconds *int `json:"gracePeriodSeconds,omitempty"`

	// Defaulted to true.
	IgnoreAllDaemonSets *bool `json:"ignoreAllDaemonSets,omitempty"`

	// Defaulted to true to proceed even when pods are using emptyDir volumes.
	DeleteEmptyDirData *bool `json:"deleteEmptyDirData,omitempty"`
}

func newHelper(ctx context.Context, client k8sClient.Interface, spec *NodeDrainSpec) *drain.Helper {
	helper := &drain.Helper{
		Ctx:                 ctx,
		Client:              client,
		Out:                 os.Stdout,
		ErrOut:              os.Stderr,
		Force:               true,
		Timeout:             2 * time.Minute,
		GracePeriodSeconds:  -1,
		IgnoreAllDaemonSets: true,
		DeleteEmptyDirData:  true,
	}

	if spec == nil {
		return helper
	}

	if spec.Force != nil {
		helper.Force = *spec.Force
	}

	if spec.Timeout != nil {
		helper.Timeout = *spec.Timeout
	}

	if spec.GracePeriodSeconds != nil {
		helper.GracePeriodSeconds = *spec.GracePeriodSeconds
	}

	if spec.IgnoreAllDaemonSets != nil {
		helper.IgnoreAllDaemonSets = *spec.IgnoreAllDaemonSets
	}

	if spec.DeleteEmptyDirData != nil {
		helper.DeleteEmptyDirData = *spec.DeleteEmptyDirData
	}

	return helper
}

// DrainNode drains the Node.
func DrainNode(client k8sClient.Interface, name string, spec *NodeDrainSpec) error {
	klog.V(args.LogLevelVerbose).Infof("Draining %s node", name)

	node, err := client.CoreV1().Nodes().Get(context.Background(), name, metaV1.GetOptions{})
	if err != nil {
		return fmt.Errorf("error getting node: %w", err)
	}

	helper := newHelper(context.Background(), client, spec)

	if err := drain.RunCordonOrUncordon(helper, node, true); err != nil {
		return fmt.Errorf("error cordoning node: %w", err)
	}

	if err := drain.RunNodeDrain(helper, name); err != nil {
		return fmt.Errorf("error draining node: %w", err)
	}

	klog.V(args.LogLevelVerbose).Infof("Successfully drained %s node", name)

	return nil
}
