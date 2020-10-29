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

package pod

import (
	"context"

	"google.golang.org/grpc"

	"github.com/kubernetes/dashboard/pkg/api/v1"
	"github.com/kubernetes/dashboard/pkg/api/v1/pod/proto"
)

type RouteHandler struct {
	proto.UnimplementedRouteServer
}

func (p *RouteHandler) List(_ context.Context, in *proto.PodListRequest) (*proto.PodList, error) {
	return &proto.PodList{Pods: []*proto.Pod{{Name: "test-pod"}}}, nil
}

func (p *RouteHandler) Install(server *grpc.Server) {
	proto.RegisterRouteServer(server, p)
}

func NewRouteHandler() v1.RouteHandler {
	return &RouteHandler{}
}
