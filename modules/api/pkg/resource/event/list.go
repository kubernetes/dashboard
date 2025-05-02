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

package event

import (
	k8sClient "k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/errors"
)

func GetEventList(client k8sClient.Interface, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*common.EventList, error) {
	klog.V(4).Infof("Getting list of events in namespace: %s", nsQuery.ToRequestParam())

	channels := &common.ResourceChannels{
		EventList: common.GetEventListChannel(client, nsQuery, 2),
	}

	return GetEventListFromChannels(channels, dsQuery)
}

func GetEventListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (*common.EventList, error) {
	err := <-channels.EventList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}

	eventList := <-channels.EventList.List
	err = <-channels.EventList.Error
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	result := CreateEventList(FillEventsType(eventList.Items), dsQuery)
	result.Errors = nonCriticalErrors

	return &result, nil
}
