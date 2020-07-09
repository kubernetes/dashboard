package options

import (
  cliflag "k8s.io/component-base/cli/flag"
  "k8s.io/component-base/cli/globalflag"
  "k8s.io/component-base/version/verflag"
)

type GlobalRunOptions struct {}

func (s *GlobalRunOptions) Flags() (fss cliflag.NamedFlagSets) {
  fs := fss.FlagSet("global")

  verflag.AddFlags(fs)
  globalflag.AddGlobalFlags(fs, "global")

  return fss
}

func NewGlobalRunOptions() *GlobalRunOptions {
  return &GlobalRunOptions{}
}
