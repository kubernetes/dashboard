package cache

import (
	"fmt"

	"github.com/Yiling-J/theine-go"
	"github.com/samber/lo"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/client/args"
)

var (
	cache *theine.Cache[string, any]
)

func init() {
	var err error
	if cache, err = theine.NewBuilder[string, any](int64(args.CacheSize())).Build(); err != nil {
		panic(err)
	}
}

func cacheKey(contextKey, key string) string {
	return fmt.Sprintf("%s:%s", contextKey, key)
}

// FromCache returns cached value...
func Get[T any](contextKey, key string) (T, bool, error) {
	// todo ensure/callback

	value, exists := cache.Get(cacheKey(contextKey, key))
	typedValue := lo.Empty[T]()
	if exists {
		typedValue = value.(T)
	}

	return typedValue, exists, nil
}

func Set[T any](contextKey, key string, value T) error {
	// todo ensure/callback

	_ = cache.SetWithTTL(cacheKey(contextKey, key), value, 1, args.CacheTTL())
	return nil
}

func DeferredLoad[T any](contextKey, key string, loadFunc func() (T, error)) {
	go func() {
		// todo ensure/callback

		cacheValue, err := loadFunc()
		if err != nil {
			klog.ErrorS(err, "failed loading cache data")
			return
		}

		_ = cache.SetWithTTL(cacheKey(contextKey, key), cacheValue, 1, args.CacheTTL())
	}()
}
