// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package client

import (
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
)

const (
	// DefaultQPS is the default globalClient QPS configuration. High enough QPS to fit all expected use cases.
	// QPS=0 is not set here, because globalClient code is overriding it.
	DefaultQPS = 1e6
	// DefaultBurst is the default globalClient burst configuration. High enough Burst to fit all expected use cases.
	// Burst=0 is not set here, because globalClient code is overriding it.
	DefaultBurst = 1e6
	// DefaultContentType is the default kubernetes protobuf content type
	DefaultContentType = "application/vnd.kubernetes.protobuf"
	// DefaultCmdConfigName is the default cluster/context/auth name to be set in clientcmd config
	DefaultCmdConfigName = "kubernetes"
	// DefaultUserAgent is the default http header for user-agent
	DefaultUserAgent = "dashboard"
	// ImpersonateUserHeader is the header name to identify username to act as.
	ImpersonateUserHeader = "Impersonate-User"
	// ImpersonateGroupHeader is the header name to identify group name to act as.
	// Can be provided multiple times to set multiple groups.
	ImpersonateGroupHeader = "Impersonate-Group"
	// ImpersonateUserExtraHeader is the header name used to associate extra fields with the user.
	// It is optional, and it requires ImpersonateUserHeader to be set.
	ImpersonateUserExtraHeader = "Impersonate-Extra-"
	// ClusterContextHeader is the header name used to associate client request with specific cluster.
	// It can be used in environments that use a proxy between Dashboard and API server to
	// forward requests to the specific cluster. Internally it ensures that the client cache
	// always matches the correct cluster.
	ClusterContextHeader = "Cluster-Context"
)

// ResourceVerber is responsible for performing generic CRUD operations on all supported resources.
type ResourceVerber interface {
	Update(object *unstructured.Unstructured) error
	Get(kind string, namespace string, name string) (runtime.Object, error)
	Delete(kind string, namespace string, name string, propagationPolicy string, deleteNow bool) error
}
