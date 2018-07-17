

package inject

import (
    "github.com/kubernetes-sigs/kubebuilder/pkg/inject/run"
    injectargs "github.com/kubernetes-sigs/kubebuilder/pkg/inject/args"

    "github.com/kubernetes-sigs/application/pkg/inject/args"
)

var (
    // Inject is used to add items to the Injector
    Inject []func(args.InjectArgs) error

    // Injector runs items
    Injector injectargs.Injector
)

// RunAll starts all of the informers and Controllers
func RunAll(rargs run.RunArguments, iargs args.InjectArgs) error {
    // Run functions to initialize injector
    for _, i := range Inject {
        if err := i(iargs); err != nil {
            return err
        }
    }
    Injector.Run(rargs)
    <-rargs.Stop
    return nil
}
