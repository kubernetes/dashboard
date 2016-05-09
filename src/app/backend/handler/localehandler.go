// Copyright 2015 Google Inc. All Rights Reserved.
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
	"strings"

	"github.com/golang/glog"
)

const defaultDir = "./public/en"

/**
 * Localization is a spec for the localization configuration of dashboard.
 */
type Localization struct {
	Translations []Translation `json:"translations"`
}

/**
 * Translation is a single translation definition spec.
 */
type Translation struct {
	File string `json:"file"`
	Key  string `json:"key"`
}

// LocaleHandler serves different html versions based on the Accept-Language header.
func LocaleHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.EscapedPath() == "/" || r.URL.EscapedPath() == "/index.html" {
		// do not store the html page in the cache
		w.Header().Add("Cache-Control", "no-store")
	}
	acceptLanguage := r.Header.Get("Accept-Language")
	dirName := determineLocalizedDir(acceptLanguage)
	http.FileServer(http.Dir(dirName)).ServeHTTP(w, r)
}

func determineLocalizedDir(locale string) string {
	locales, err := getSupportedLocales()
	if err != nil {
		return defaultDir
	}
	tokens := strings.Split(locale, "-")
	if len(tokens) == 0 {
		return defaultDir
	}
	matchedLocale := ""
	for _, l := range locales {
		if l == tokens[0] {
			matchedLocale = l
		}
	}
	localeDir := "./public/" + matchedLocale
	if matchedLocale != "" && dirExists(localeDir) {
		return localeDir
	}
	return defaultDir
}

func dirExists(name string) bool {
	if _, err := os.Stat(name); err != nil {
		if os.IsNotExist(err) {
			return false
		}
	}
	return true
}

func getSupportedLocales() ([]string, error) {
	// read config file
	localesFile, err := ioutil.ReadFile("./public/locale_conf.json")
	if err != nil {
		return []string{}, err
	}

	// unmarshall
	localization := Localization{}
	err = json.Unmarshal(localesFile, &localization)
	if err != nil {
		glog.Warning(err)
	}

	// filter locale keys
	result := []string{}
	for _, translation := range localization.Translations {
		result = append(result, translation.Key)
	}
	return result, nil
}
