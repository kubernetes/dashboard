

package args

import (
    "time"

	"github.com/kubernetes-sigs/kubebuilder/pkg/inject/args"
    "k8s.io/client-go/rest"

    "github.com/kubernetes-sigs/application/pkg/client/clientset/versioned"
    "github.com/kubernetes-sigs/application/pkg/client/informers/externalversions"
)

// InjectArgs are the arguments need to initialize controllers
type InjectArgs struct {
    args.InjectArgs

    Clientset *versioned.Clientset
    Informers externalversions.SharedInformerFactory
}


// CreateInjectArgs returns new controller args
func CreateInjectArgs(config *rest.Config) InjectArgs {
    cs := versioned.NewForConfigOrDie(config)
    return InjectArgs{
        InjectArgs: args.CreateInjectArgs(config),
        Clientset: cs,
        Informers: externalversions.NewSharedInformerFactory(cs, 2 * time.Minute),
    }
}
