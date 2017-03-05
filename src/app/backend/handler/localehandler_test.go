package handler

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"reflect"
	"testing"
)

func TestGetSupportedLocales(t *testing.T) {
	cases := []struct {
		localization Localization
		expected     []string
	}{
		{
			Localization{
				Translations: []Translation{
					{File: "en/index.html", Key: "en"},
					{File: "ja/index.html", Key: "ja"},
				},
			},
			[]string{"en", "ja"},
		},
		{
			Localization{},
			[]string{},
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
				SupportedLocales: []string{"en", "ja"},
			},
			false,
			"en",
			defaultDir,
		},
		{
			&LocaleHandler{
				SupportedLocales: []string{"en", "ja"},
			},
			false,
			"de",
			defaultDir,
		},
		{
			&LocaleHandler{
				SupportedLocales: []string{"en", "ja"},
			},
			false,
			"ja",
			defaultDir,
		},
		{
			&LocaleHandler{
				SupportedLocales: []string{"en", "ja"},
			},
			true,
			"ja",
			"./public/ja",
		},
		{
			&LocaleHandler{
				SupportedLocales: []string{"en", "ja"},
			},
			true,
			"ja,en-US;q=0.8,en;q=0.6",
			"./public/ja",
		},
		{
			&LocaleHandler{
				SupportedLocales: []string{"en", "ja"},
			},
			true,
			"af,ja,en-US;q=0.8,en;q=0.6",
			"./public/ja",
		},
		{
			&LocaleHandler{
				SupportedLocales: []string{"en", "ja"},
			},
			true,
			"af,en-US;q=0.8,en;q=0.6",
			"./public/en",
		},
		{
			&LocaleHandler{
				SupportedLocales: []string{"en", "ja"},
			},
			true,
			"",
			defaultDir,
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
					err = os.Mkdir("./public/"+lang, 0777)
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
