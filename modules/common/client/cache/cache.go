package cache

import (
	"sync"

	"github.com/Yiling-J/theine-go"
	"github.com/samber/lo"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/client/args"
	"k8s.io/dashboard/errors"
)

var (
	pool sync.Map
)

func newCache() *theine.Cache[string, any] {
	c, _ := theine.NewBuilder[string, any](int64(args.CacheSize())).Build()
	return c
}

// FromCache returns cached value from the specific cache pool instance.
func FromCache[T any](poolKey, cacheKey string) (T, bool, error) {
	if err := ensureConfigurationValid(poolKey); err != nil {
		return lo.Empty[T](), false, err
	}

	genericCache, exists := pool.Load(poolKey)
	if !exists {
		// If cache does not exist in the pool, create
		// a new one and store it in the cache pool
		emptyCache := newCache()
		pool.Store(poolKey, emptyCache)
		return lo.Empty[T](), false, nil
	}

	typedCache := genericCache.(*theine.Cache[string, any])
	typedValue := lo.Empty[T]()
	value, exists := typedCache.Get(cacheKey)
	if exists {
		typedValue = value.(T)
	}

	return typedValue, exists, nil
}

func SetCacheValue[T any](poolKey, cacheKey string, value T) error {
	if err := ensureConfigurationValid(poolKey); err != nil {
		return err
	}

	genericCache, exists := pool.Load(poolKey)
	if !exists {
		genericCache = newCache()
	}

	typedCache := genericCache.(*theine.Cache[string, any])
	_ = typedCache.SetWithTTL(cacheKey, value, 1, args.CacheTTL())
	pool.Store(poolKey, typedCache)
	return nil
}

func DeferredCacheLoad[T any](poolKey, cacheKey string, loadFunc func() (T, error)) {
	go func() {
		if err := ensureConfigurationValid(poolKey); err != nil {
			klog.ErrorS(err, "failed validating cache configuration")
			return
		}

		genericCache, exists := pool.Load(poolKey)
		if !exists {
			genericCache = newCache()
		}

		typedCache := genericCache.(*theine.Cache[string, any])
		cacheValue, err := loadFunc()
		if err != nil {
			klog.ErrorS(err, "failed loading cache data")
			return
		}

		_ = typedCache.SetWithTTL(cacheKey, cacheValue, 1, args.CacheTTL())
		pool.Store(poolKey, typedCache)
	}()
}

func ensureConfigurationValid(key string) error {
	if len(key) == 0 && args.ClusterContextEnabled() {
		return errors.NewBadRequest("Cluster-Context header cannot be empty when cluster-context-enabled flag is set to true")
	}

	if len(key) > 0 && !args.ClusterContextEnabled() {
		return errors.NewBadRequest("Cluster-Context header cannot be provided when cluster-context-enabled flag is set to false")
	}

	return nil
}
