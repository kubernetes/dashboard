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

package cronjob_test

import (
	"context"
	"strings"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/cronjob"
	batch "k8s.io/api/batch/v1beta1"
	"k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
)

func TestTriggerCronJobWithInvalidName(t *testing.T) {
	client := fake.NewSimpleClientset()

	err := cronjob.TriggerCronJob(client, namespace, "invalidName")
	if !errors.IsNotFound(err) {
		t.Error("TriggerCronJob should return error when invalid name is passed")
	}
}

//create a job from a cronjob which has a 52 character name (max length)
func TestTriggerCronJobWithLongName(t *testing.T) {
	longName := strings.Repeat("test", 13)

	cron := batch.CronJob{
		ObjectMeta: metaV1.ObjectMeta{
			Name:      longName,
			Namespace: namespace,
			Labels:    labels,
		}, TypeMeta: metaV1.TypeMeta{
			Kind:       "CronJob",
			APIVersion: "v1",
		}}

	client := fake.NewSimpleClientset(&cron)
	err := cronjob.TriggerCronJob(client, namespace, longName)
	if err != nil {
		t.Error(err)
	}
}

func TestTriggerCronJob(t *testing.T) {

	cron := batch.CronJob{
		ObjectMeta: metaV1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
		}, TypeMeta: metaV1.TypeMeta{
			Kind:       "CronJob",
			APIVersion: "v1",
		}, Spec: batch.CronJobSpec{
			Schedule: "* * * * *",
			JobTemplate: batch.JobTemplateSpec{
				ObjectMeta: metaV1.ObjectMeta{
					Namespace: namespace,
					Labels:    labels,
				},
			},
		},
	}

	client := fake.NewSimpleClientset(&cron)

	err := cronjob.TriggerCronJob(client, namespace, name)
	if err != nil {
		t.Error(err)
	}

	//check if client has the newly triggered job
	list, err := client.BatchV1().Jobs(namespace).List(context.TODO(), metaV1.ListOptions{})
	if err != nil {
		t.Error(err)
	}
	if len(list.Items) != 1 {
		t.Error(err)
	}
}
