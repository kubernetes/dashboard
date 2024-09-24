// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package locale

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"golang.org/x/text/language"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/web/pkg/args"
	"k8s.io/dashboard/web/pkg/router"
)

const defaultLocaleDir = "en"
const assetsDir = "public"

var supportedLocales = getSupportedLocales()

func init() {
	router.Router().Use(localeHandler("/"))
}

func getAcceptLanguage(c *gin.Context) string {
	acceptLanguage := ""
	cookie, err := c.Cookie("lang")
	if err == nil {
		acceptLanguage = cookie
	}

	if len(acceptLanguage) == 0 {
		acceptLanguage = os.Getenv("ACCEPT_LANGUAGE")
	}

	if len(acceptLanguage) == 0 {
		acceptLanguage = c.GetHeader("Accept-Language")
	}

	return acceptLanguage
}

func localeHandler(urlPrefix string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.EscapedPath() == "/" || c.Request.URL.EscapedPath() == "/index.html" {
			// Do not store the html page in the cache. If the user is to click on 'switch language',
			// we want a different index.html (for the right locale) to be served when the page refreshes.
			c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		}

		// Disable directory listing.
		if c.Request.URL.Path != "/" && strings.HasSuffix(c.Request.URL.Path, "/") {
			klog.InfoS("Directory listing is disabled", "requestPath", c.Request.URL.Path)
			c.AbortWithStatusJSON(http.StatusNotFound, "page not found")
			return
		}

		acceptLanguage := getAcceptLanguage(c)
		dirName := determineLocalizedDir(acceptLanguage)
		directory := static.LocalFile(dirName, true)

		// Fallback to index.html if request file does not exist.
		if !directory.Exists(urlPrefix, c.Request.URL.Path) {
			klog.V(2).InfoS("Directory does not exist", "directory", directory, "dirName", dirName, "acceptLanguage", acceptLanguage, "urlPath", c.Request.URL.Path, "urlPrefix", urlPrefix)
			c.Request.URL.Path = "/"
		}

		fileServer := http.FileServer(directory)

		if urlPrefix != "" {
			fileServer = http.StripPrefix(urlPrefix, fileServer)
		}

		fileServer.ServeHTTP(c.Writer, c.Request)
		c.Abort()
	}
}

func getSupportedLocales() (tags []language.Tag) {
	localesFile, err := os.ReadFile(args.LocaleConfig())
	if err != nil {
		klog.Warningf("Dashboard will not be localized, cannot load config: %s", err)
		return
	}

	localization := Localization{}
	err = json.Unmarshal(localesFile, &localization)
	if err != nil {
		klog.Warningf("%s %s", string(localesFile), err)
	}

	for _, translation := range localization.Translations {
		tags = append(tags, language.Make(translation))
	}
	return
}

// Localization is a spec for the localization configuration of dashboard.
type Localization struct {
	Translations []string `json:"translations"`
}

// getAssetsDir determines the absolute path to the localized frontend assets
func getAssetsDir() string {
	path, err := os.Executable()
	if err != nil {
		klog.Fatalf("Error determining path to executable: %#v", err)
	}
	path, err = filepath.EvalSymlinks(path)
	if err != nil {
		klog.Fatalf("Error evaluating symlinks for path '%s': %#v", path, err)
	}
	return filepath.Join(filepath.Dir(path), assetsDir)
}

func determineLocalizedDir(locale string) string {
	// TODO(floreks): Remove that once new locale codes are supported by the browsers.
	// For backward compatibility only.
	localeMap := strings.NewReplacer(
		"zh-CN", "zh-Hans",
		"zh-cn", "zh-Hans",
		"zh-TW", "zh-Hant",
		"zh-tw", "zh-Hant",
		"zh-hk", "zh-Hant-HK",
		"zh-HK", "zh-Hant-HK",
	)

	return getLocaleDir(localeMap.Replace(locale))
}

func getLocaleDir(locale string) string {
	localeDir := ""
	assetsDir := getAssetsDir()
	tags, _, _ := language.ParseAcceptLanguage(locale)
	localeMap := getLocaleMap()

	for _, tag := range tags {
		if _, exists := localeMap[tag.String()]; exists {
			localeDir = filepath.Join(assetsDir, tag.String())
			break
		}
	}

	if dirExists(localeDir) {
		return localeDir
	}

	return filepath.Join(assetsDir, defaultLocaleDir)
}

func getLocaleMap() map[string]struct{} {
	result := map[string]struct{}{}
	for _, tag := range supportedLocales {
		result[tag.String()] = struct{}{}
	}

	return result
}

func dirExists(name string) bool {
	if _, err := os.Stat(name); err != nil {
		if os.IsNotExist(err) {
			klog.Warning(name)
			return false
		}
	}

	return true
}
