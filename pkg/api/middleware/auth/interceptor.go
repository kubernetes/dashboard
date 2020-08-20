package auth

import (
  "context"

  "google.golang.org/grpc"
  "k8s.io/klog"
)

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

func NewAuthInterceptor() Interceptor {
  return Interceptor{"Auth"}
}
