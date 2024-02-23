package environment

const dev = "0.0.0-dev"

// Version of this binary
var Version = dev

func IsDev() bool {
	return Version == dev
}
