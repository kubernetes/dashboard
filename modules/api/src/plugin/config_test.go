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

package plugin

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/plugin/apis/v1alpha1"

	"github.com/emicklei/go-restful/v3"
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	"github.com/kubernetes/dashboard/src/app/backend/plugin/client/clientset/versioned"
	fakePluginClientset "github.com/kubernetes/dashboard/src/app/backend/plugin/client/clientset/versioned/fake"
	v1 "k8s.io/api/authorization/v1"
	coreV1 "k8s.io/api/core/v1"
	"k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	fakeK8sClient "k8s.io/client-go/kubernetes/fake"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/tools/clientcmd/api"
)

func Test_handleConfig(t *testing.T) {
	ns := "default"
	pluginName := "test-plugin"
	filename := "plugin-test.js"
	cfgMapName := "plugin-test-cfgMap"
	h := Handler{&fakeClientManager{}}

	pcs, _ := h.cManager.PluginClient(nil)
	_, _ = pcs.DashboardV1alpha1().Plugins(ns).Create(context.TODO(), &v1alpha1.Plugin{
		ObjectMeta: metaV1.ObjectMeta{Name: pluginName, Namespace: ns},
		Spec: v1alpha1.PluginSpec{
			Source: v1alpha1.Source{
				ConfigMapRef: &coreV1.ConfigMapEnvSource{
					LocalObjectReference: coreV1.LocalObjectReference{Name: cfgMapName},
				},
				Filename: filename}},
	}, metaV1.CreateOptions{})

	httpReq, _ := http.NewRequest(http.MethodGet, "/api/v1/plugin/config", nil)
	req := restful.NewRequest(httpReq)

	httpWriter := httptest.NewRecorder()
	resp := restful.NewResponse(httpWriter)

	h.handleConfig(req, resp)
}

type fakeClientManager struct {
	k8sClient    kubernetes.Interface
	pluginClient versioned.Interface
}

func (cm *fakeClientManager) Client(req *restful.Request) (kubernetes.Interface, error) {
	panic("implement me")
}

func (cm *fakeClientManager) InsecureClient() kubernetes.Interface {
	if cm.k8sClient == nil {
		cm.k8sClient = fakeK8sClient.NewSimpleClientset()
	}
	return cm.k8sClient
}

func (cm *fakeClientManager) APIExtensionsClient(req *restful.Request) (clientset.Interface, error) {
	panic("implement me")
}

func (cm *fakeClientManager) PluginClient(req *restful.Request) (versioned.Interface, error) {
	if cm.pluginClient == nil {
		cm.pluginClient = fakePluginClientset.NewSimpleClientset()
	}
	return cm.pluginClient, nil
}

func (cm *fakeClientManager) InsecureAPIExtensionsClient() clientset.Interface {
	panic("implement me")
}

func (cm *fakeClientManager) InsecurePluginClient() versioned.Interface {
	if cm.pluginClient == nil {
		cm.pluginClient = fakePluginClientset.NewSimpleClientset()
	}
	return cm.pluginClient
}

func (cm *fakeClientManager) CanI(req *restful.Request, ssar *v1.SelfSubjectAccessReview) bool {
	panic("implement me")
}

func (cm *fakeClientManager) Config(req *restful.Request) (*rest.Config, error) {
	panic("implement me")
}

func (cm *fakeClientManager) ClientCmdConfig(req *restful.Request) (clientcmd.ClientConfig, error) {
	panic("implement me")
}

func (cm *fakeClientManager) CSRFKey() string {
	panic("implement me")
}

func (cm *fakeClientManager) HasAccess(authInfo api.AuthInfo) (string, error) {
	panic("implement me")
}

func (cm *fakeClientManager) VerberClient(req *restful.Request, config *rest.Config) (clientapi.ResourceVerber, error) {
	panic("implement me")
}

func (cm *fakeClientManager) SetTokenManager(manager authApi.TokenManager) {
	panic("implement me")
}
