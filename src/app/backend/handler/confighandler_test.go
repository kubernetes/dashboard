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

package handler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/args"
)

func TestGetAppConfigJSON(t *testing.T) {
	type test struct {
		namespace string
		want      string
	}
	tests := []test{
		{
			namespace: "default",
			want:      `"defaultNamespace":"default"`,
		},
		{
			namespace: "my-namespace",
			want:      `"defaultNamespace":"my-namespace"`,
		},
	}

	for _, tc := range tests {
		builder := args.GetHolderBuilder()
		builder.SetNamespace(tc.namespace)
		got := getAppConfigJSON()
		if !strings.Contains(got, tc.want) {
			t.Fatalf("expected: %v, got: %v", tc.want, got)
		}
	}
}

func TestConfigHandler(t *testing.T) {
	r, err := http.NewRequest(http.MethodGet, "/", nil)
	if err != nil {
		t.Fatal(err)
	}
	w := httptest.NewRecorder()

	statusCode, _ := ConfigHandler(w, r)
	if statusCode != http.StatusOK {
		t.Errorf("Unexpected status code %d", statusCode)
	}
}
