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

package auth

import (
  "context"

  "google.golang.org/grpc"
  "k8s.io/klog"
)

const name = "Auth"

type Interceptor struct {
  name string
}

func (i Interceptor) Unary(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
  klog.Infof("[%s] Intercepting unary call to: %s", i.name, info.FullMethod)
  return handler(ctx, req)
}

func (i Interceptor) Stream(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
  klog.Infof("[%s] Intercepting stream call to: %s", i.name, info.FullMethod)
  return handler(srv, stream)
}

func NewInterceptor() Interceptor {
  return Interceptor{name}
}
