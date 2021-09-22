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

package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/golang/glog"
	"golang.org/x/text/language"

	"github.com/kubernetes/dashboard/src/app/backend/args"
)

const defaultLocaleDir = "en"
const assetsDir = "public"

// Localization is a spec for the localization configuration of dashboard.
type Localization struct {
	Translations []string `json:"translations"`
}

// LocaleHandler serves different localized versions of the frontend application
// based on the Accept-Language header.
type LocaleHandler struct {
	SupportedLocales []language.Tag
}

// CreateLocaleHandler loads the localization configuration and constructs a LocaleHandler.
func CreateLocaleHandler() *LocaleHandler {
	locales, err := getSupportedLocales(args.Holder.GetLocaleConfig())
	if err != nil {
		glog.Warningf("Error when loading the localization configuration. Dashboard will not be localized. %s", err)
		locales = []language.Tag{}
	}
	return &LocaleHandler{SupportedLocales: locales}
}

func getSupportedLocales(configFile string) ([]language.Tag, error) {
	// read config file
	localesFile, err := os.ReadFile(configFile)
	if err != nil {
		return []language.Tag{}, err
	}

	// unmarshall
	localization := Localization{}
	err = json.Unmarshal(localesFile, &localization)
	if err != nil {
		glog.Warningf("%s %s", string(localesFile), err)
	}

	// filter locale keys
	result := []language.Tag{}
	for _, translation := range localization.Translations {
		result = append(result, language.Make(translation))
	}
	return result, nil
}

// getAssetsDir determines the absolute path to the localized frontend assets
func getAssetsDir() string {
	path, err := os.Executable()
	if err != nil {
		glog.Fatalf("Error determining path to executable: %#v", err)
	}
	path, err = filepath.EvalSymlinks(path)
	if err != nil {
		glog.Fatalf("Error evaluating symlinks for path '%s': %#v", path, err)
	}
	return filepath.Join(filepath.Dir(path), assetsDir)
}

// LocaleHandler serves different html versions based on the Accept-Language header.
func (handler *LocaleHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.EscapedPath() == "/" || r.URL.EscapedPath() == "/index.html" {
		// Do not store the html page in the cache. If the user is to click on 'switch language',
		// we want a different index.html (for the right locale) to be served when the page refreshes.
		w.Header().Add("Cache-Control", "no-cache, no-store, must-revalidate")
	}

	// Disable directory listing.
	if r.URL.Path != "/" && strings.HasSuffix(r.URL.Path, "/") {
		http.NotFound(w, r)
		return
	}

	acceptLanguage := ""
	cookie, err := r.Cookie("lang")
	if err == nil {
		acceptLanguage = cookie.Value
	}

	if len(acceptLanguage) == 0 {
		acceptLanguage = os.Getenv("ACCEPT_LANGUAGE")
	}

	if len(acceptLanguage) == 0 {
		acceptLanguage = r.Header.Get("Accept-Language")
	}

	dirName := handler.determineLocalizedDir(acceptLanguage)
	http.FileServer(http.Dir(dirName)).ServeHTTP(w, r)
}

func (handler *LocaleHandler) determineLocalizedDir(locale string) string {
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

	return handler.getLocaleDir(localeMap.Replace(locale))
}

func (handler *LocaleHandler) getLocaleDir(locale string) string {
	localeDir := ""
	assetsDir := getAssetsDir()
	tags, _, _ := language.ParseAcceptLanguage(locale)
	localeMap := handler.getLocaleMap()

	for _, tag := range tags {
		if _, exists := localeMap[tag.String()]; exists {
			localeDir = filepath.Join(assetsDir, tag.String())
			break
		}
	}

	if handler.dirExists(localeDir) {
		return localeDir
	}

	return filepath.Join(assetsDir, defaultLocaleDir)
}

func (handler *LocaleHandler) getLocaleMap() map[string]struct{} {
	result := map[string]struct{}{}
	for _, tag := range handler.SupportedLocales {
		result[tag.String()] = struct{}{}
	}

	return result
}

func (handler *LocaleHandler) dirExists(name string) bool {
	if _, err := os.Stat(name); err != nil {
		if os.IsNotExist(err) {
			glog.Warningf(name)
			return false
		}
	}

	return true
}
