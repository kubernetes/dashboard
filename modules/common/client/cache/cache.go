package cache

import (
	"sync"
	"time"

	"github.com/Yiling-J/theine-go"
	"github.com/samber/lo"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/client/args"
)

var (
	cache      *theine.Cache[string, any]
	cacheLocks sync.Map
)

func init() {
	var err error
	if cache, err = theine.NewBuilder[string, any](int64(args.CacheSize())).Build(); err != nil {
		panic(err)
	}
}

func Get[T any](key Key) (T, bool, error) {
	typedValue := lo.Empty[T]()

	cacheKey, err := key.SHA()
	if err != nil {
		return typedValue, false, err
	}

	value, exists := cache.Get(cacheKey)
	if exists {
		typedValue = value.(T)
	}

	return typedValue, exists, nil
}

func Set[T any](key Key, value T) error {
	cacheKey, err := key.SHA()
	if err != nil {
		return err
	}

	_ = cache.SetWithTTL(cacheKey, value, 1, args.CacheTTL())
	return nil
}

func DeferredLoad[T any](key Key, loadFunc func() (T, error)) {
	go func() {
		cacheKey, err := key.SHA()
		if err != nil {
			klog.ErrorS(err, "failed loading cache key", "key", cacheKey)
			return
		}

		_, locked := cacheLocks.Load(cacheKey)
		if locked {
			klog.V(4).InfoS("cache is already being updated, skipping", "key", cacheKey)
			return
		}

		cacheLocks.Store(cacheKey, struct{}{})
		defer time.AfterFunc(args.CacheRefreshDebounce(), func() {
			cacheLocks.Delete(cacheKey)
			klog.V(4).InfoS("released cache update lock", "key", cacheKey)
		})

		cacheValue, err := loadFunc()
		if err != nil {
			klog.ErrorS(err, "failed loading cache data", "key", cacheKey)
			return
		}

		_ = cache.SetWithTTL(cacheKey, cacheValue, 1, args.CacheTTL())
		klog.V(4).InfoS("cache updated successfully", "key", cacheKey)
	}()
}
