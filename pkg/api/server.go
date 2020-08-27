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

package api

import (
  "fmt"
  "net"

  "google.golang.org/grpc"
  "google.golang.org/grpc/reflection"
  "k8s.io/klog"

  "github.com/kubernetes/dashboard/pkg/api/middleware"
  v1 "github.com/kubernetes/dashboard/pkg/api/v1"
  "github.com/kubernetes/dashboard/pkg/api/v1/deployment"
  "github.com/kubernetes/dashboard/pkg/api/v1/pod"
  "github.com/kubernetes/dashboard/pkg/cmd/dashboard/options"
)

// VERSION of this binary
var Version = "DEV"

type Server struct {
  options *options.Options
  grpc    *grpc.Server
}

func (s *Server) Run() error {
  klog.Infof("starting Kubernetes Dashboard API Server: %+v", Version)

  // TODO: Handle HTTPS connection
  listener, err := net.Listen("tcp", fmt.Sprintf("%s:%d", s.options.InsecureBindAddress, s.options.InsecurePort))
  if err != nil {
    klog.Fatalf("failed to listen: %v", err)
  }

  klog.Infof("listening on %s:%d", s.options.InsecureBindAddress, s.options.InsecurePort)

  s.init()
  return s.grpc.Serve(listener)
}

func (s *Server) init() {
  unaryInterceptors := middleware.NewUnaryInterceptorBuilder().Add(middleware.InterceptorTypeAuth).AsOptions()
  streamInterceptors := middleware.NewStreamInterceptorBuilder().Add(middleware.InterceptorTypeAuth).AsOptions()

  s.grpc = grpc.NewServer(append(unaryInterceptors, streamInterceptors...)...)

  s.register(
    pod.NewPodRouteHandler(),
    deployment.NewDeploymentRouteHandler(),
  )

  // Enable reflection so we can find available routes
  // TODO: Disable reflection once API is stable
  reflection.Register(s.grpc)
}

func (s *Server) register(routes ...v1.RouteHandler) {
  for _, route := range routes {
    route.Install(s.grpc)
  }
}

func NewServer(options *options.Options) *Server {
  return &Server{options: options}
}
