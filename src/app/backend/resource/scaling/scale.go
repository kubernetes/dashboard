package scale

import (
	"fmt"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
	"strconv"
	"strings"
)

type ReplicaCounts struct {
	DesiredReplicas int32 `json:"desiredReplicas"`
	ActualReplicas  int32 `json:"actualReplicas"`
}

func GetScaleSpec(client client.Interface, kind, namespace, name string) (rc *ReplicaCounts, err error) {
	rc = new(ReplicaCounts)
	s, err := client.Extensions().Scales(namespace).Get(kind, name)
	if err != nil {
		return nil, err
	}

	rc.DesiredReplicas = s.Spec.Replicas
	rc.ActualReplicas = s.Status.Replicas

	return
}

func ScaleResource(client client.Interface, kind, namespace, name, count string) (rc *ReplicaCounts, err error) {
	rc = new(ReplicaCounts)

	fmt.Println(kind)

	if strings.ToLower(kind) == "job" {
		err = scaleJobResource(client, namespace, name, count, rc)
	} else {
		err = scaleGenericResource(client, kind, namespace, name, count, rc)
	}

	if err != nil {
		return nil, err
	}

	return
}

func scaleGenericResource(client client.Interface, kind, namespace, name, count string, rc *ReplicaCounts) error {
	s, err := client.Extensions().Scales(namespace).Get(kind, name)
	if err != nil {
		return err
	}

	c, err := strconv.Atoi(count)
	if err != nil {
		return err
	}
	s.Spec.Replicas = int32(c)

	s, err = client.Extensions().Scales(namespace).Update(kind, s)
	if err != nil {
		return err
	}

	rc.DesiredReplicas = s.Spec.Replicas
	rc.ActualReplicas = s.Status.Replicas

	return nil
}

func scaleJobResource(client client.Interface, namespace, name, count string, rc *ReplicaCounts) error {
	j, err := client.BatchV1().Jobs(namespace).Get(name, metaV1.GetOptions{})

	c, err := strconv.Atoi(count)
	if err != nil {
		return err
	}
	*j.Spec.Parallelism = int32(c)
	j, err = client.BatchV1().Jobs(namespace).Update(j)

	rc.DesiredReplicas = *j.Spec.Parallelism
	rc.ActualReplicas = *j.Spec.Parallelism

	return nil
}
