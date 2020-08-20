package api

import (
  "fmt"
  "net"

  "google.golang.org/grpc"
  "google.golang.org/grpc/reflection"
  "k8s.io/klog"

  "github.com/kubernetes/dashboard/pkg/api/middleware"
  "github.com/kubernetes/dashboard/pkg/api/v1/deployment"
  "github.com/kubernetes/dashboard/pkg/api/v1/pod"
  "github.com/kubernetes/dashboard/pkg/cmd/dashboard/options"
)

// VERSION of this binary
var Version = "DEV"

type GRPCServer struct {
  options *options.Options
}

func (s *GRPCServer) Run() error {
  klog.Infof("starting Kubernetes Dashboard API Server: %+v", Version)

  listener, err := net.Listen("tcp", fmt.Sprintf("%s:%d", s.options.InsecureBindAddress, s.options.InsecurePort))
  if err != nil {
    klog.Fatalf("failed to listen: %v", err)
  }

  klog.Infof("listening on %s:%d", s.options.InsecureBindAddress, s.options.InsecurePort)

  // Create the server
  server := s.server()

  // Install routes
  s.install(server)

  // Enable reflection so we can find out available routes
  reflection.Register(server)

  // Start the server
  return server.Serve(listener)
}

func (s *GRPCServer) server() *grpc.Server {
  unaryInterceptors := middleware.NewUnaryInterceptorBuilder().Add(middleware.InterceptorTypeAuth).AsOptions()
  streamInterceptors := middleware.NewStreamInterceptorBuilder().Add(middleware.InterceptorTypeAuth).AsOptions()

  return grpc.NewServer(append(unaryInterceptors, streamInterceptors...)...)
}

func (s *GRPCServer) install(server *grpc.Server) {
  pod.NewPodRouteHandler().Install(server)
  deployment.NewDeploymentRouteHandler().Install(server)
}

func NewGRPCServer(options *options.Options) *GRPCServer {
  return &GRPCServer{options: options}
}
