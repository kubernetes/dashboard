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

package dashboard

import (
  "fmt"

  "github.com/spf13/cobra"
  "k8s.io/apiserver/pkg/util/term"
  cliflag "k8s.io/component-base/cli/flag"

  "github.com/kubernetes/dashboard/pkg/api"
  "github.com/kubernetes/dashboard/pkg/cmd/dashboard/options"
)

var CMD *cobra.Command

func NewAPIServerCommand() *cobra.Command {
  apiOptions := options.NewAPIServerRunOption()
  metricsOptions := options.NewMetricsRunOptions()
  uiOptions := options.NewUIRunOptions()
  globalOptions := options.NewGlobalRunOptions()

  CMD = &cobra.Command{
    Use: "dashboard",
    Long: `The Kubernetes Dashboard API Server provides REST/GRPC API for the Kubernetes Dashboard UI`,
    SilenceUsage: true,
    RunE: func(cmd *cobra.Command, args []string) error {
      opts := &options.Options{
        APIServerRunOptions: apiOptions,
        MetricsRunOptions:   metricsOptions,
        UIRunOptions:        uiOptions,
      }
      grpc := api.NewServer(opts)
      return grpc.Run()
    },
  }

  flags := CMD.Flags()
  apiFlags := apiOptions.Flags()
  metricsFlags := metricsOptions.Flags()
  uiFlags := uiOptions.Flags()
  globalFlags := globalOptions.Flags()

  for _, fs := range apiFlags.FlagSets {
    flags.AddFlagSet(fs)
  }

  for _, fs := range metricsFlags.FlagSets {
    flags.AddFlagSet(fs)
  }

  for _, fs := range uiFlags.FlagSets {
    flags.AddFlagSet(fs)
  }

  usageFmt := "Usage:\n %s\n"
  cols, _, _ := term.TerminalSize(CMD.OutOrStdout())
  CMD.SetUsageFunc(func(cmd *cobra.Command) error {
    fmt.Fprintf(cmd.OutOrStderr(), usageFmt, cmd.UseLine())
    cliflag.PrintSections(cmd.OutOrStderr(), apiFlags, cols)
    cliflag.PrintSections(cmd.OutOrStderr(), metricsFlags, cols)
    cliflag.PrintSections(cmd.OutOrStderr(), uiFlags, cols)
    cliflag.PrintSections(cmd.OutOrStderr(), globalFlags, cols)
    return nil
  })

  CMD.SetHelpFunc(func(cmd *cobra.Command, args []string) {
    fmt.Fprintf(cmd.OutOrStdout(), "%s\n\n"+usageFmt, cmd.Long, cmd.UseLine())
    cliflag.PrintSections(cmd.OutOrStdout(), apiFlags, cols)
    cliflag.PrintSections(cmd.OutOrStdout(), metricsFlags, cols)
    cliflag.PrintSections(cmd.OutOrStdout(), uiFlags, cols)
    cliflag.PrintSections(cmd.OutOrStdout(), globalFlags, cols)
  })

  return CMD
}
