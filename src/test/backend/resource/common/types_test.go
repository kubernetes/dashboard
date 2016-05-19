package common

import (
	"testing"

	"k8s.io/kubernetes/pkg/api/unversioned"
)

func TestIsSelectorMatching(t *testing.T) {
	cases := []struct {
		serviceSelector, replicationControllerSelector map[string]string
		expected                                       bool
	}{
		{nil, nil, false},
		{nil, map[string]string{}, false},
		{map[string]string{}, nil, false},
		{map[string]string{}, map[string]string{}, false},
		{map[string]string{"app": "my-name"}, map[string]string{}, false},
		{map[string]string{"app": "my-name", "version": "2"},
			map[string]string{"app": "my-name", "version": "1.1"}, false},
		{map[string]string{"app": "my-name", "env": "prod"},
			map[string]string{"app": "my-name", "version": "1.1"}, false},
		{map[string]string{"app": "my-name"}, map[string]string{"app": "my-name"}, true},
		{map[string]string{"app": "my-name", "version": "1.1"},
			map[string]string{"app": "my-name", "version": "1.1"}, true},
		{map[string]string{"app": "my-name"},
			map[string]string{"app": "my-name", "version": "1.1"}, true},
	}
	for _, c := range cases {
		actual := IsSelectorMatching(c.serviceSelector, c.replicationControllerSelector)
		if actual != c.expected {
			t.Errorf("isSelectorMatching(%+v, %+v) == %+v, expected %+v",
				c.serviceSelector, c.replicationControllerSelector, actual, c.expected)
		}
	}
}

func TestIsLabelSelectorMatching(t *testing.T) {
	cases := []struct {
		serviceSelector   map[string]string
		daemonSetselector *unversioned.LabelSelector
		expected          bool
	}{
		{nil, nil, false},
		{nil, &unversioned.LabelSelector{MatchLabels: map[string]string{}}, false},
		{map[string]string{}, nil, false},
		{map[string]string{}, &unversioned.LabelSelector{MatchLabels: map[string]string{}},
			false},
		{map[string]string{"app": "my-name"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{}},
			false},
		{map[string]string{"app": "my-name", "version": "2"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name", "version": "1.1"}},
			false},
		{map[string]string{"app": "my-name", "env": "prod"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name", "version": "1.1"}},
			false},
		{map[string]string{"app": "my-name"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name"}},
			true},
		{map[string]string{"app": "my-name", "version": "1.1"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name", "version": "1.1"}},
			true},
		{map[string]string{"app": "my-name"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name", "version": "1.1"}},
			true},
	}
	for _, c := range cases {
		actual := IsLabelSelectorMatching(c.serviceSelector, c.daemonSetselector)
		if actual != c.expected {
			t.Errorf("isLabelSelectorMatching(%+v, %+v) == %+v, expected %+v",
				c.serviceSelector, c.daemonSetselector, actual, c.expected)
		}
	}
}
