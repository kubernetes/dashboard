package args

import (
	"time"

	"github.com/spf13/pflag"
)

var (
	argCacheEnabled          = pflag.Bool("cache-enabled", true, "whether client cache should be enabled or not")
	argClusterContextEnabled = pflag.Bool("cluster-context-enabled", false, "whether multi-cluster cache context support should be enabled or not")
	argTokenExchangeEndpoint = pflag.String("token-exchange-endpoint", "", "endpoint used in multi-cluster cache to exchange tokens for context identifiers")
	argCacheSize             = pflag.Int("cache-size", 1000, "max number of cache entries")
	argCacheTTL              = pflag.Duration("cache-ttl", 10*time.Minute, "cache entry TTL")
)

func CacheEnabled() bool {
	return *argCacheEnabled
}

func ClusterContextEnabled() bool {
	if *argClusterContextEnabled && len(*argTokenExchangeEndpoint) == 0 {
		panic("token-exchange-endpoint must be set when cluster-context-enabled is set to true")
	}

	return *argClusterContextEnabled
}

func TokenExchangeEndpoint() string {
	return *argTokenExchangeEndpoint
}

func CacheSize() int {
	return *argCacheSize
}

func CacheTTL() time.Duration {
	return *argCacheTTL
}
