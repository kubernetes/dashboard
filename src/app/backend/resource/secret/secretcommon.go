// Copyright 2015 Google Inc. All Rights Reserved.
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

package secret

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
)

// The code below allows to perform complex data section on
type SelectableSecretList []api.Secret

var propertyGetters = map[string]func(SelectableSecretList, int)(common.ComparableValueInterface){
	"name": func(self SelectableSecretList, i int)(common.ComparableValueInterface){return common.StdComparableString(self[i].ObjectMeta.Name)},
	"creationTimestamp": func(self SelectableSecretList, i int)(common.ComparableValueInterface){return common.StdComparableTime(self[i].ObjectMeta.CreationTimestamp.Time)},
	"namespace": func(self SelectableSecretList, i int)(common.ComparableValueInterface){return common.StdComparableString(self[i].ObjectMeta.Namespace)},
}

// its a bit pain to define these, just copy and paste...
func (self SelectableSecretList) Len() int {return len(self)}
func (self SelectableSecretList) Slice(start, end int) common.SelectableInterface {return self[start:end]}
func (self SelectableSecretList) Swap(i int, j int) {self[i], self[j] = self[j], self[i]}

func (self SelectableSecretList) GetPropertyAtIndex(name string, i int) common.ComparableValueInterface {
	getter, isGetterPresent := propertyGetters[name]
	if !isGetterPresent {
		// if getter not present then just return a constant dummy value, sort will have no effect.
		return common.StdComparableInt(0)
	}
	return getter(self, i)
}
// -------------------

