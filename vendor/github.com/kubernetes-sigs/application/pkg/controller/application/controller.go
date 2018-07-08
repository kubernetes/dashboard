

package application

import (
    "log"

    "github.com/kubernetes-sigs/kubebuilder/pkg/controller"
    "github.com/kubernetes-sigs/kubebuilder/pkg/controller/types"

    appv1alpha1client "github.com/kubernetes-sigs/application/pkg/client/clientset/versioned/typed/app/v1alpha1"
    appv1alpha1lister "github.com/kubernetes-sigs/application/pkg/client/listers/app/v1alpha1"
    appv1alpha1 "github.com/kubernetes-sigs/application/pkg/apis/app/v1alpha1"
    appv1alpha1informer "github.com/kubernetes-sigs/application/pkg/client/informers/externalversions/app/v1alpha1"
    "github.com/kubernetes-sigs/application/pkg/inject/args"
)

// EDIT THIS FILE
// This files was created by "kubebuilder create resource" for you to edit.
// Controller implementation logic for Application resources goes here.

func (bc *ApplicationController) Reconcile(k types.ReconcileKey) error {
    // INSERT YOUR CODE HERE
    log.Printf("Implement the Reconcile function on application.ApplicationController to reconcile %s\n", k.Name)
    return nil
}

// +controller:group=app,version=v1alpha1,kind=Application,resource=applications
type ApplicationController struct {
    // INSERT ADDITIONAL FIELDS HERE
    applicationLister appv1alpha1lister.ApplicationLister
    applicationclient appv1alpha1client.AppV1alpha1Interface
}

// ProvideController provides a controller that will be run at startup.  Kubebuilder will use codegeneration
// to automatically register this controller in the inject package
func ProvideController(arguments args.InjectArgs) (*controller.GenericController, error) {
    // INSERT INITIALIZATIONS FOR ADDITIONAL FIELDS HERE
    bc := &ApplicationController{
        applicationLister: arguments.ControllerManager.GetInformerProvider(&appv1alpha1.Application{}).(appv1alpha1informer.ApplicationInformer).Lister(),
        applicationclient: arguments.Clientset.AppV1alpha1(),
    }

    // Create a new controller that will call ApplicationController.Reconcile on changes to Applications
    gc := &controller.GenericController{
        Name: "ApplicationController",
        Reconcile: bc.Reconcile,
        InformerRegistry: arguments.ControllerManager,
    }
    if err := gc.Watch(&appv1alpha1.Application{}); err != nil {
        return gc, err
    }

    // INSERT ADDITIONAL WATCHES HERE BY CALLING gc.Watch.*() FUNCTIONS
    // NOTE: Informers for Kubernetes resources *MUST* be registered in the pkg/inject package so that they are started.
    return gc, nil
}
