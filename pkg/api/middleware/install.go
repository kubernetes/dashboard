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

package middleware

import (
  "context"

  "google.golang.org/grpc"
  "k8s.io/klog"

  "github.com/kubernetes/dashboard/pkg/api/middleware/auth"
)

type InterceptorType string

// All supported interceptors are defined here
const (
  InterceptorTypeAuth InterceptorType = "Auth"
)

type InterceptorKind string

const (
  InterceptorKindUnary = "Unary"
  InterceptorKindStream = "Stream"
)

type Interceptor interface {
  Unary(context.Context, interface{}, *grpc.UnaryServerInfo, grpc.UnaryHandler) (interface{}, error)
  Stream(interface{}, grpc.ServerStream, *grpc.StreamServerInfo, grpc.StreamHandler) error
}

type InterceptorBuilder interface {
  Add(interceptorType InterceptorType) InterceptorBuilder
  AsOptions() []grpc.ServerOption
}

type UnaryInterceptorBuilder struct {
  unimplementedInterceptor

  interceptors []InterceptorType
}

func (u UnaryInterceptorBuilder) Add(interceptorType InterceptorType) InterceptorBuilder {
  u.interceptors = append(u.interceptors, interceptorType)
  return u
}

func (u UnaryInterceptorBuilder) AsOptions() []grpc.ServerOption {
  result := make([]grpc.ServerOption, 0)
  for _, i := range u.interceptors {
    result = append(result, u.getOptionForType(i, InterceptorKindUnary))
  }

  return result
}

type StreamInterceptorBuilder struct {
  unimplementedInterceptor

  interceptors []InterceptorType
}

func (s StreamInterceptorBuilder) Add(interceptorType InterceptorType) InterceptorBuilder {
  s.interceptors = append(s.interceptors, interceptorType)
  return s
}

func (s StreamInterceptorBuilder) AsOptions() []grpc.ServerOption {
  result := make([]grpc.ServerOption, 0)
  for _, i := range s.interceptors {
    result = append(result, s.getOptionForType(i, InterceptorKindStream))
  }

  return result
}

type unimplementedInterceptor struct {}

func (u unimplementedInterceptor) getOptionForType(interceptorType InterceptorType, kind InterceptorKind) grpc.ServerOption {
  switch interceptorType {
  case InterceptorTypeAuth:
    return u.getOptionForKind(auth.NewInterceptor(), kind)
  }

  klog.Fatalf("Unsupported interceptor type provided: %s", interceptorType)
  return nil
}

func (u unimplementedInterceptor) getOptionForKind(interceptor Interceptor, kind InterceptorKind) grpc.ServerOption {
  switch kind {
  case InterceptorKindUnary:
    return grpc.UnaryInterceptor(interceptor.Unary)
  case InterceptorKindStream:
    return grpc.StreamInterceptor(interceptor.Stream)
  }

  klog.Fatalf("Unsupported interceptor kind provided: %s", kind)
  return nil
}

func NewUnaryInterceptorBuilder() InterceptorBuilder {
  return UnaryInterceptorBuilder{}
}

func NewStreamInterceptorBuilder() InterceptorBuilder {
  return StreamInterceptorBuilder{}
}
