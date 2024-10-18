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
	// cache is a global resource cache that maps our custom keys
	// created based on information provided by the specific resource client.
	// It stores resource lists to speed up the client response times.
	cache *theine.Cache[string, any]

	// cacheLocks is used as a set that holds information about
	// cache keys that are currently fetching the latest data from the
	// kubernetes API server in the background.
	// It allows us to avoid multiple concurrent update calls being sent
	// to the Kubernetes API.
	// Once the lock is removed, the next update call can be initiated.
	cacheLocks sync.Map

	// syncedLoadLock is used to synchronize the initial cache hydration phase
	// and avoid putting extra pressure on the API server.
	syncedLoadLock sync.Mutex
)

func init() {
	var err error
	if cache, err = theine.NewBuilder[string, any](int64(args.CacheSize())).Build(); err != nil {
		panic(err)
	}
}

// Get gives access to cache entries. It requires Key structure
// to be provided which is used to calculate cache key SHA.
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

// Set allows updating cache with specific values.
// It requires Key structure to be provided which is used to calculate cache key SHA.
func Set[T any](key Key, value T) error {
	cacheKey, err := key.SHA()
	if err != nil {
		return err
	}

	_ = cache.SetWithTTL(cacheKey, value, 1, args.CacheTTL())
	return nil
}

// DeferredLoad updates cache in the background with the data fetched using the loadFunc.
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

// SyncedLoad initializes the cache using the [loadFunc]. It ensures that there will be no concurrent
// calls to the [loadFunc]. First call will call the [loadFunc] and initialize the cache while
// concurrent calls will be waiting for the first call to finish. Once cache is updated and lock is freed
// other routines will return the value from cache without making any extra calls to the [loadFunc].
func SyncedLoad[T any](key Key, loadFunc func() (*T, error)) (*T, error) {
	cacheKey, err := key.SHA()
	if err != nil {
		klog.ErrorS(err, "failed loading cache key", "key", cacheKey)
		return new(T), err
	}

	syncedLoadLock.Lock()
	defer syncedLoadLock.Unlock()

	if value, exists := cache.Get(cacheKey); exists {
		klog.V(4).InfoS("synced from the cache", "key", cacheKey)
		return value.(*T), nil
	}

	cacheValue, err := loadFunc()
	if err != nil {
		klog.ErrorS(err, "failed loading cache data", "key", cacheKey)
		return new(T), err
	}

	_ = cache.SetWithTTL(cacheKey, cacheValue, 1, args.CacheTTL())
	klog.V(4).InfoS("cache initialized successfully", "key", cacheKey)

	return cacheValue, nil
}
