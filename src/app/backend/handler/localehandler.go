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
	"io/ioutil"
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
	localesFile, err := ioutil.ReadFile(configFile)
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
		if translation != strings.ToLower(translation) {
			// Add locale in lowercase
			result = append(result, language.Make(strings.ToLower(translation)))
		}
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

func getLocaleDirs() map[string]string {
	var localeDirs = map[string]string{}
	assetsDir := getAssetsDir()
	entries, err := ioutil.ReadDir(assetsDir)
	if err != nil {
		glog.Warningf(err.Error())
		return localeDirs
	}
	for _, entry := range entries {
		if entry.IsDir() {
			localeDirs[entry.Name()] = assetsDir + "/" + entry.Name()
			// Support locale in lower case
			localeDirs[strings.ToLower(entry.Name())] = assetsDir + "/" + entry.Name()
		}
	}
	return localeDirs
}

// LocaleHandler serves different html versions based on the Accept-Language header.
func (handler *LocaleHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.EscapedPath() == "/" || r.URL.EscapedPath() == "/index.html" {
		// Do not store the html page in the cache. If the user is to click on 'switch language',
		// we want a different index.html (for the right locale) to be served when the page refreshes.
		w.Header().Add("Cache-Control", "no-store")
	}
	acceptLanguage := os.Getenv("ACCEPT_LANGUAGE")
	if acceptLanguage == "" {
		acceptLanguage = r.Header.Get("Accept-Language")
	}

	dirName := handler.determineLocalizedDir(acceptLanguage)
	http.FileServer(http.Dir(dirName)).ServeHTTP(w, r)
}

func (handler *LocaleHandler) determineLocalizedDir(locale string) string {
	// TODO(floreks): Remove that once new locale codes are supported by the browsers,
	// or golang.org/x/text/language map properly.
	// For backward compatibility only.
	// Also, support locales in lowercase.
	localeMap := strings.NewReplacer(
		"zh-CN", "zh-Hans",
		"zh-cn", "zh-Hans",
		"zh-TW", "zh-Hant",
		"zh-tw", "zh-Hant",
	)
	// Replace old locale codes to new ones, e.g. zh-CN -> zh-Hans
	locale = localeMap.Replace(locale)

	assetsDir := getAssetsDir()
	defaultDir := filepath.Join(assetsDir, defaultLocaleDir)
	tags, _, err := language.ParseAcceptLanguage(locale)
	if err != nil || len(tags) == 0 {
		return defaultDir
	}

	locales := handler.SupportedLocales
	tag, _, confidence := language.NewMatcher(locales).Match(tags...)

	localeDir := ""
	if confidence == language.Exact {
		// Locales supported by dashboard, i.e. locale_conf.json, can get proper locale directory.
		// e.g. `de`, `fr`, `ja`, `ko`, `zh-Hans`, `zh-Hant`, `zh-Hant-HK`
		localeDir = handler.getSupportedLocaleDir(tag.String())
	}

	if localeDir == "" {
		return defaultDir
	}
	return localeDir
}

func (handler *LocaleHandler) getSupportedLocaleDir(locale string) string {
	locales := handler.SupportedLocales
	localeDirs := getLocaleDirs()
	for _, l := range locales {
		if l.String() == locale || strings.ToLower(l.String()) == locale {
			dir, ok := localeDirs[locale]
			if ok {
				return dir
			}
			return ""
		}
	}
	return ""
}
