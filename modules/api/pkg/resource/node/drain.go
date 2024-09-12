package node

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
	"k8s.io/kubectl/pkg/drain"
)

// DrainNode drains the Node.
func DrainNode(client k8sClient.Interface, name string) error {
	log.Printf("Draining %s node", name)

	helper := &drain.Helper{
		Ctx:                 context.Background(),
		Client:              client,
		Force:               true,
		GracePeriodSeconds:  -1,
		IgnoreAllDaemonSets: true,
		Out:                 os.Stdout,
		ErrOut:              os.Stderr,
		Timeout:             60 * time.Second,
		DeleteEmptyDirData:  true, // Proceed even when pods are using emptyDir volumes
	}

	node, err := client.CoreV1().Nodes().Get(context.Background(), name, metaV1.GetOptions{})
	if err != nil {
		if apierrors.IsNotFound(err) {
			return nil
		}
		return fmt.Errorf("error getting node: %v", err)
	}

	if err := drain.RunCordonOrUncordon(helper, node, true); err != nil {
		if apierrors.IsNotFound(err) {
			return nil
		}
		return fmt.Errorf("error cordoning node: %v", err)
	}

	if err := drain.RunNodeDrain(helper, name); err != nil {
		if apierrors.IsNotFound(err) {
			return nil
		}
		return fmt.Errorf("error draining node: %v", err)
	}

	log.Printf("Successfully drained %s node ", name)

	return nil
}
