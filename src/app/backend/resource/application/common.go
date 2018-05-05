package application

import (
	application "github.com/kubernetes-sigs/application/pkg/apis/app/v1alpha1"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

// The code below allows to perform complex data section on []application.Application

type ApplicationCell application.Application

func (self ApplicationCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func toCells(std []application.Application) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = ApplicationCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []application.Application {
	std := make([]application.Application, len(cells))
	for i := range std {
		std[i] = application.Application(cells[i].(ApplicationCell))
	}
	return std
}
