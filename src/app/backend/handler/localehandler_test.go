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
	"os"
	"reflect"
	"testing"

	"golang.org/x/text/language"
)

func languageMake(locales []string) []language.Tag {
	result := []language.Tag{}
	for _, locale := range locales {
		result = append(result, language.Make(locale))
	}
	return result
}

func TestGetSupportedLocales(t *testing.T) {
	cases := []struct {
		localization Localization
		expected     []language.Tag
	}{
		{
			Localization{
				Translations: []Translation{
					{File: "en/index.html", Key: "en"},
					{File: "ja/index.html", Key: "ja"},
				},
			},
			languageMake([]string{"en", "ja"}),
		},
		{
			Localization{},
			[]language.Tag{},
		},
	}

	for _, c := range cases {
		configFile, err := ioutil.TempFile("", "test-locale-config")
		if err != nil {
			t.Fatalf("%s", err)
		}
		defer os.Remove(configFile.Name())

		fileContent, _ := json.Marshal(c.localization)
		configFile.Write(fileContent)
		actual, _ := getSupportedLocales(configFile.Name())
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getSupportedLocales() returns %#v, expected %#v", actual, c.expected)
		}
	}
}

func TestDetermineLocale(t *testing.T) {
	cases := []struct {
		handler           *LocaleHandler
		createDir         bool
		acceptLanguageKey string
		expected          string
	}{
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "ja"}),
			},
			false,
			"en",
			defaultDir,
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "ja"}),
			},
			false,
			"de",
			defaultDir,
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "ja"}),
			},
			false,
			"ja",
			defaultDir,
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "ja"}),
			},
			true,
			"ja",
			"./public/ja",
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "ja"}),
			},
			true,
			"ja,en-US;q=0.8,en;q=0.6",
			"./public/ja",
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "ja"}),
			},
			true,
			"af,ja,en-US;q=0.8,en;q=0.6",
			"./public/ja",
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "ja"}),
			},
			true,
			"af,en-US;q=0.8,en;q=0.6",
			"./public/en",
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "ja"}),
			},
			true,
			"",
			defaultDir,
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "zh-tw", "zh-hk", "zh", "ar-dz"}),
			},
			true,
			"en",
			"./public/en",
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "zh-tw", "zh-hk", "zh", "ar-dz"}),
			},
			true,
			"zh",
			"./public/zh",
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "zh-tw", "zh-hk", "zh", "ar-dz"}),
			},
			true,
			"zh-cn",
			"./public/zh",
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "zh-tw", "zh-hk", "zh", "ar-dz"}),
			},
			true,
			"ar",
			"./public/en",
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "zh-tw", "zh-hk", "zh", "ar-dz"}),
			},
			true,
			"ar-bh",
			"./public/en",
		},
		{
			&LocaleHandler{
				SupportedLocales: languageMake([]string{"en", "zh-tw", "zh", "ar-dz"}),
			},
			true,
			"af,zh-HK,zh;q=0.8,en;q=0.6",
			"./public/zh",
		},
	}

	for _, c := range cases {
		func() {
			if c.createDir {
				err := os.Mkdir("./public", 0777)
				if err != nil {
					t.Fatalf("%s", err)
				}
				for _, lang := range c.handler.SupportedLocales {
					err = os.Mkdir("./public/"+lang.String(), 0777)
					if err != nil {
						t.Fatalf("%s", err)
					}
				}
				defer os.RemoveAll("./public")
			}
			actual := c.handler.determineLocalizedDir(c.acceptLanguageKey)
			if !reflect.DeepEqual(actual, c.expected) {
				t.Errorf("localeHandler.determineLocalizedDir() returns %#v, expected %#v", actual, c.expected)
			}
		}()
	}
}
