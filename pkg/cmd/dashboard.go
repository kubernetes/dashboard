package main

import (
  "math/rand"
  "os"
  "time"

  "k8s.io/component-base/logs"

  "github.com/kubernetes/dashboard/pkg/cmd/dashboard"
)

func main() {
  rand.Seed(time.Now().UnixNano())

  logs.InitLogs()
  defer logs.FlushLogs()

  command := dashboard.NewAPIServerCommand()
  if err := command.Execute(); err != nil {
    os.Exit(1)
  }
}
