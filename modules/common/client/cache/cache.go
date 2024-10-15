package cache

import (
	"fmt"
	"sync"
	"time"

	"github.com/Yiling-J/theine-go"
	"github.com/samber/lo"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/client/args"
)

var (
	cache        *theine.Cache[string, any]
	contextCache *theine.Cache[string, string]
	cacheLocks   sync.Map
)

func init() {
	var err error
	if cache, err = theine.NewBuilder[string, any](int64(args.CacheSize())).Build(); err != nil {
		panic(err)
	}
}

func getCacheKey(token, key string) (string, error) {
	if !args.ClusterContextEnabled() {
		return key, nil
	}

	contextKey, exists := contextCache.Get(token)
	if exists {
		klog.V(4).InfoS("context key found in cache", "key", contextKey)
		return fmt.Sprintf("%s:%s", contextKey, key), nil
	}

	contextKey, err := exchangeToken(token)
	if err != nil {
		return "", err
	}

	contextCache.SetWithTTL(token, contextKey, 1, args.CacheTTL())
	return fmt.Sprintf("%s:%s", contextKey, key), nil
}

func Get[T any](token, key string) (T, bool, error) {
	typedValue := lo.Empty[T]()

	cacheKey, err := getCacheKey(token, key)
	if err != nil {
		return typedValue, false, err
	}

	value, exists := cache.Get(cacheKey)
	if exists {
		typedValue = value.(T)
	}

	return typedValue, exists, nil
}

func Set[T any](token, key string, value T) error {
	cacheKey, err := getCacheKey(token, key)
	if err != nil {
		return err
	}
	_ = cache.SetWithTTL(cacheKey, value, 1, args.CacheTTL())
	return nil
}

func DeferredLoad[T any](token, key string, loadFunc func() (T, error)) {
	go func() {
		cacheKey, err := getCacheKey(token, key)
		if err != nil {
			klog.ErrorS(err, "failed loading cache key")
			return
		}

		_, locked := cacheLocks.Load(cacheKey)
		if locked {
			klog.V(4).InfoS("cache is already being updated, skipping")
			return
		}

		cacheLocks.Store(cacheKey, struct{}{})
		defer time.AfterFunc(args.CacheRefreshDebounce(), func() {
			cacheLocks.Delete(cacheKey)
			klog.V(4).InfoS("released cache update lock")
		})

		cacheValue, err := loadFunc()
		if err != nil {
			klog.ErrorS(err, "failed loading cache data")
			return
		}

		_ = cache.SetWithTTL(cacheKey, cacheValue, 1, args.CacheTTL())
		klog.V(4).InfoS("cache updated successfully")
	}()
}
