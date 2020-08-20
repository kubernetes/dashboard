package deployment

import (
  "context"

  "google.golang.org/grpc"

  "github.com/kubernetes/dashboard/pkg/api/v1/deployment/proto"
)

type RouteHandler struct {
  proto.UnimplementedRouteServer
}

func (p *RouteHandler) List(_ context.Context, in *proto.DeploymentListRequest) (*proto.DeploymentList, error) {
  return &proto.DeploymentList{Deployments: []*proto.Deployment{{Name: "test-deployment"}}}, nil
}

func (p *RouteHandler) Install(server *grpc.Server) {
  proto.RegisterRouteServer(server, p)
}

func NewDeploymentRouteHandler() *RouteHandler {
  return &RouteHandler{}
}
