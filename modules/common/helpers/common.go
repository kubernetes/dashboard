package helpers

import (
	"os"
	"strings"
)

// GetEnv - Lookup the environment variable provided and set to default value if variable isn't found
func GetEnv(key, fallback string) string {
	if value := os.Getenv(key); len(value) > 0 {
		return value
	}

	return fallback
}

// GetResourceFromPath extracts the resource from the URL path /api/v1/<action>.
// Ignores potential subresources.
func GetResourceFromPath(path string) *string {
	if !strings.HasPrefix(path, "/api/v1") {
		return nil
	}

	parts := strings.Split(path, "/")
	if len(parts) < 3 {
		return nil
	}
	
	return &parts[3]
}
