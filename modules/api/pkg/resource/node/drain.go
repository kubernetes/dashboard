package node

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
	"k8s.io/kubectl/pkg/drain"
)

// NodeDrainSpec is a specification to control the behavior of drainer.
type NodeDrainSpec struct {
	// Defaulted to true.
	Force *bool `json:"force"`

	// Defaulted to 2 minutes.
	Timeout *time.Duration `json:"timeout"`

	// GracePeriodSeconds is how long to wait for a pod to terminate.
	// 0 means "delete immediately".
	// Set negative value to use pod's terminationGracePeriodSeconds.
	// Defaulted to -1.
	GracePeriodSeconds *int `json:"gracePeriodSeconds"`

	// Defaulted to true.
	IgnoreAllDaemonSets *bool `json:"ignoreAllDaemonSets"`

	// Defaulted to true to proceed even when pods are using emptyDir volumes.
	DeleteEmptyDirData *bool `json:"deleteEmptyDirData"`
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
	log.Printf("Draining %s node", name)

	node, err := client.CoreV1().Nodes().Get(context.Background(), name, metaV1.GetOptions{})
	if err != nil {
		return fmt.Errorf("error getting node: %v", err)
	}

	helper := newHelper(context.Background(), client, spec)

	if err := drain.RunCordonOrUncordon(helper, node, true); err != nil {
		return fmt.Errorf("error cordoning node: %v", err)
	}

	if err := drain.RunNodeDrain(helper, name); err != nil {
		return fmt.Errorf("error draining node: %v", err)
	}

	log.Printf("Successfully drained %s node", name)

	return nil
}
