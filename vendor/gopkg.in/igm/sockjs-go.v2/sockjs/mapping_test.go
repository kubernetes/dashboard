package sockjs

import (
	"net/http"
	"regexp"
	"testing"
)

func TestMappingMatcher(t *testing.T) {
	mappingPrefix := mapping{"GET", regexp.MustCompile("prefix/$"), nil}
	mappingPrefixRegExp := mapping{"GET", regexp.MustCompile(".*x/$"), nil}

	var testRequests = []struct {
		mapping       mapping
		method        string
		url           string
		expectedMatch matchType
	}{
		{mappingPrefix, "GET", "http://foo/prefix/", fullMatch},
		{mappingPrefix, "POST", "http://foo/prefix/", pathMatch},
		{mappingPrefix, "GET", "http://foo/prefix_not_mapped", noMatch},
		{mappingPrefixRegExp, "GET", "http://foo/prefix/", fullMatch},
	}

	for _, request := range testRequests {
		req, _ := http.NewRequest(request.method, request.url, nil)
		m := request.mapping
		match, method := m.matches(req)
		if match != request.expectedMatch {
			t.Errorf("mapping %s should match url=%s", m.path, request.url)
		}
		if request.expectedMatch == pathMatch {
			if method != m.method {
				t.Errorf("Matcher method should be %s, but got %s", m.method, method)
			}
		}
	}
}
