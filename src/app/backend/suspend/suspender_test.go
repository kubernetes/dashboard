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
  "testing"
  "k8s.io/client-go/kubernetes/fake"
  meta "k8s.io/apimachinery/pkg/apis/meta/v1"
  "k8s.io/api/batch/v1beta1"
)
func TestSuspendCronJob(t *testing.T) {
  True := true
  ptrue := &True
  cli := fake.NewSimpleClientset(&v1beta1.CronJob{
      TypeMeta: meta.TypeMeta{
        Kind: "cronjob",
        APIVersion:"v1",
      },
      ObjectMeta:  meta.ObjectMeta{
        Name: "cron2",
        Namespace: "default",
      },
      Spec: v1beta1.CronJobSpec{
        Suspend: ptrue,
      }})


  _, err := SuspendCronJob(cli, "default", "cron2", "true")
  if err != nil {
    t.Fatal("Unable to Suspend CronJob")
  }
}
