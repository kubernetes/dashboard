package application

import (
	"log"

	application "github.com/kubernetes-sigs/application/pkg/apis/app/v1alpha1"
	applicationAlphaClient "github.com/kubernetes-sigs/application/pkg/client/clientset/versioned"
	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

// ApplicationList structure is a TODO
type ApplicationList struct {
	ListMeta api.ListMeta `json:"listMeta"`

	// Unordered list of Deployments.
	Applications []Application `json:"applications"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// Application is a TODO
type Application struct {
	ObjectMeta        api.ObjectMeta                `json:"objectMeta"`
	TypeMeta          api.TypeMeta                  `json:"typeMeta"`
	ApplicationStatus application.ApplicationStatus `json:"applicationStatus"`
}

func getApplicationStatus(application application.Application) application.ApplicationStatus {
	return application.Status
}

// GetApplicationList returns a list of all Application in the cluster.
func GetApplicationList(client applicationAlphaClient.Interface, nsQuery *common.NamespaceQuery, dsQuery *dataselect.DataSelectQuery) (*ApplicationList, error) {
	log.Print("Getting list of all applications in the cluster")

	channel := common.GetApplicationListChannel(client, nsQuery, 1)

	applications := <-channel.List
	err := <-channel.Error
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	applicationList := toApplicationList(applications.Items, nonCriticalErrors, dsQuery)
	return applicationList, nil
}

func toApplicationList(applications []application.Application, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery) *ApplicationList {

	result := &ApplicationList{
		Applications: make([]Application, 0),
		ListMeta:     api.ListMeta{TotalItems: len(applications)},
		Errors:       nonCriticalErrors,
	}

	applicationCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(applications), dsQuery)

	applications = fromCells(applicationCells)
	result.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, application := range applications {
		result.Applications = append(result.Applications, Application{
			ObjectMeta:        api.NewObjectMeta(application.ObjectMeta),
			TypeMeta:          api.NewTypeMeta(api.ResourceKindApplication),
			ApplicationStatus: application.Status,
		})
	}

	return result
}
