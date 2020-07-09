package pod

import (
  "context"

  "google.golang.org/grpc"

  "github.com/kubernetes/dashboard/pkg/api/v1/pod/proto"
)

type RouteHandler struct {
  proto.UnimplementedRoutePodServer
}

func (p *RouteHandler) GetPods(_ context.Context, in *proto.Request) (*proto.PodList, error) {
  return &proto.PodList{Pods: []*proto.Pod{{Name: "test-pod"}}}, nil
}

func (p *RouteHandler) Install(server *grpc.Server) error {
  proto.RegisterRoutePodServer(server, p)
  return nil
}

func NewPodRouteHandler() *RouteHandler {
  return &RouteHandler{}
}
