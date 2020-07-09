package v1

import (
  "google.golang.org/grpc"
)

type RouteHandler interface {
  Install(server *grpc.Server) error
}
