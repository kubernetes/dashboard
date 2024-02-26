package environment

import (
	"fmt"
)

const (
	userAgent = "dashboard-web-go"
	dev       = "0.0.0-dev"
)

// Version of this binary
var Version = dev

func IsDev() bool {
	return Version == dev
}

func UserAgent() string {
	return fmt.Sprintf("%s:%s", userAgent, Version)
}
