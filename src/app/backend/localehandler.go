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

package main

import (
	"net/http"
	"os"
	"strings"
)

const defaultDir = "./public/en"

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
	tokens := strings.Split(locale, "-")
	if len(tokens) == 0 {
		return defaultDir
	}
	localeDir := "./public/" + tokens[0]
	if dirExists(localeDir) && tokens[0] != "" {
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
