package plugin

import (
	pluginclientset "github.com/kubernetes/dashboard/src/app/backend/plugin/client/clientset/versioned"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func GetPluginSource(client pluginclientset.Interface, k8sClient kubernetes.Interface, ns string, name string) ([]byte, error) {
	plugin, err := client.DashboardV1alpha1().Plugins(ns).Get(name, v1.GetOptions{})
	if err != nil {
		return nil, err
	}
	cfgMap, err := k8sClient.CoreV1().ConfigMaps(ns).Get(plugin.Spec.Source.ConfigMapRef.Name, v1.GetOptions{})
	if err != nil {
		return nil, err
	}
	return []byte(cfgMap.Data[plugin.Spec.Source.Filename]), nil
}
