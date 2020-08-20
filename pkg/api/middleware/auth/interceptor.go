package auth

import (
  "context"

  "google.golang.org/grpc"
  "k8s.io/klog"
)

type Interceptor struct {}

func (i Interceptor) InterceptUnary(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
  klog.Info("Intercepting unary call")
  return handler(ctx, req)
}

func (i Interceptor) InterceptStream(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
  klog.Info("Intercepting stream call")
  return handler(srv, stream)
}

func NewAuthInterceptor() Interceptor {
  return Interceptor{}
}
