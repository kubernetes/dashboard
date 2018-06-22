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

package suspend

import (
  client "k8s.io/client-go/kubernetes"
  meta "k8s.io/apimachinery/pkg/apis/meta/v1"
  "errors"
)

type SuspendStatus struct {
  Suspend bool `json:"suspend"`
}

func SuspendCronJob (client client.Interface, namespace, name, suspend string) (cj *SuspendStatus, err error) {
  cj = new(SuspendStatus)
  cron, err := client.BatchV1beta1().CronJobs(namespace).Get(name, meta.GetOptions{})
  if err != nil {
    return nil, err
  }

  if suspend == "true" {
  *cron.Spec.Suspend = true
  } else if suspend == "false"{
  *cron.Spec.Suspend = false
  } else{
  return nil, errors.New("Suspend value must be true or false")
  }
  cj.Suspend = *cron.Spec.Suspend

  cron, err = client.BatchV1beta1().CronJobs(namespace).Update(cron)
  if err != nil {
    return nil, err
  }

  return cj, nil
}
