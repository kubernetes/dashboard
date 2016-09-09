package semver

import (
	"testing"
)

func TestNewVersion(t *testing.T) {
	tests := []struct {
		version string
		err     bool
	}{
		{"1.2.3", false},
		{"v1.2.3", false},
		{"1.0", false},
		{"v1.0", false},
		{"1", false},
		{"v1", false},
		{"1.2.beta", true},
		{"v1.2.beta", true},
		{"foo", true},
		{"1.2-5", false},
		{"v1.2-5", false},
		{"1.2-beta.5", false},
		{"v1.2-beta.5", false},
		{"\n1.2", true},
		{"\nv1.2", true},
		{"1.2.0-x.Y.0+metadata", false},
		{"v1.2.0-x.Y.0+metadata", false},
		{"1.2.0-x.Y.0+metadata-width-hypen", false},
		{"v1.2.0-x.Y.0+metadata-width-hypen", false},
		{"1.2.3-rc1-with-hypen", false},
		{"v1.2.3-rc1-with-hypen", false},
		{"1.2.3.4", true},
		{"v1.2.3.4", true},
	}

	for _, tc := range tests {
		_, err := NewVersion(tc.version)
		if tc.err && err == nil {
			t.Fatalf("expected error for version: %s", tc.version)
		} else if !tc.err && err != nil {
			t.Fatalf("error for version %s: %s", tc.version, err)
		}
	}
}

func TestOriginal(t *testing.T) {
	tests := []string{
		"1.2.3",
		"v1.2.3",
		"1.0",
		"v1.0",
		"1",
		"v1",
		"1.2-5",
		"v1.2-5",
		"1.2-beta.5",
		"v1.2-beta.5",
		"1.2.0-x.Y.0+metadata",
		"v1.2.0-x.Y.0+metadata",
		"1.2.0-x.Y.0+metadata-width-hypen",
		"v1.2.0-x.Y.0+metadata-width-hypen",
		"1.2.3-rc1-with-hypen",
		"v1.2.3-rc1-with-hypen",
	}

	for _, tc := range tests {
		v, err := NewVersion(tc)
		if err != nil {
			t.Errorf("Error parsing version %s", tc)
		}

		o := v.Original()
		if o != tc {
			t.Errorf("Error retrieving originl. Expected '%s' but got '%s'", tc, v)
		}
	}
}

func TestParts(t *testing.T) {
	v, err := NewVersion("1.2.3-beta.1+build.123")
	if err != nil {
		t.Error("Error parsing version 1.2.3-beta.1+build.123")
	}

	if v.Major() != 1 {
		t.Error("Major() returning wrong value")
	}
	if v.Minor() != 2 {
		t.Error("Minor() returning wrong value")
	}
	if v.Patch() != 3 {
		t.Error("Patch() returning wrong value")
	}
	if v.Prerelease() != "beta.1" {
		t.Error("Prerelease() returning wrong value")
	}
	if v.Metadata() != "build.123" {
		t.Error("Metadata() returning wrong value")
	}
}

func TestString(t *testing.T) {
	tests := []struct {
		version  string
		expected string
	}{
		{"1.2.3", "1.2.3"},
		{"v1.2.3", "1.2.3"},
		{"1.0", "1.0.0"},
		{"v1.0", "1.0.0"},
		{"1", "1.0.0"},
		{"v1", "1.0.0"},
		{"1.2-5", "1.2.0-5"},
		{"v1.2-5", "1.2.0-5"},
		{"1.2-beta.5", "1.2.0-beta.5"},
		{"v1.2-beta.5", "1.2.0-beta.5"},
		{"1.2.0-x.Y.0+metadata", "1.2.0-x.Y.0+metadata"},
		{"v1.2.0-x.Y.0+metadata", "1.2.0-x.Y.0+metadata"},
		{"1.2.0-x.Y.0+metadata-width-hypen", "1.2.0-x.Y.0+metadata-width-hypen"},
		{"v1.2.0-x.Y.0+metadata-width-hypen", "1.2.0-x.Y.0+metadata-width-hypen"},
		{"1.2.3-rc1-with-hypen", "1.2.3-rc1-with-hypen"},
		{"v1.2.3-rc1-with-hypen", "1.2.3-rc1-with-hypen"},
	}

	for _, tc := range tests {
		v, err := NewVersion(tc.version)
		if err != nil {
			t.Errorf("Error parsing version %s", tc)
		}

		s := v.String()
		if s != tc.expected {
			t.Errorf("Error generating string. Expected '%s' but got '%s'", tc.expected, s)
		}
	}
}

func TestCompare(t *testing.T) {
	tests := []struct {
		v1       string
		v2       string
		expected int
	}{
		{"1.2.3", "1.5.1", -1},
		{"2.2.3", "1.5.1", 1},
		{"2.2.3", "2.2.2", 1},
		{"3.2-beta", "3.2-beta", 0},
		{"1.3", "1.1.4", 1},
		{"4.2", "4.2-beta", 1},
		{"4.2-beta", "4.2", -1},
		{"4.2-alpha", "4.2-beta", -1},
		{"4.2-alpha", "4.2-alpha", 0},
		{"4.2-beta.2", "4.2-beta.1", 1},
		{"4.2-beta2", "4.2-beta1", 1},
		{"4.2-beta", "4.2-beta.2", -1},
		{"4.2-beta", "4.2-beta.foo", 1},
		{"4.2-beta.2", "4.2-beta", 1},
		{"4.2-beta.foo", "4.2-beta", -1},
		{"1.2+bar", "1.2+baz", 0},
	}

	for _, tc := range tests {
		v1, err := NewVersion(tc.v1)
		if err != nil {
			t.Errorf("Error parsing version: %s", err)
		}

		v2, err := NewVersion(tc.v2)
		if err != nil {
			t.Errorf("Error parsing version: %s", err)
		}

		a := v1.Compare(v2)
		e := tc.expected
		if a != e {
			t.Errorf(
				"Comparison of '%s' and '%s' failed. Expected '%d', got '%d'",
				tc.v1, tc.v2, e, a,
			)
		}
	}
}

func TestLessThan(t *testing.T) {
	tests := []struct {
		v1       string
		v2       string
		expected bool
	}{
		{"1.2.3", "1.5.1", true},
		{"2.2.3", "1.5.1", false},
		{"3.2-beta", "3.2-beta", false},
	}

	for _, tc := range tests {
		v1, err := NewVersion(tc.v1)
		if err != nil {
			t.Errorf("Error parsing version: %s", err)
		}

		v2, err := NewVersion(tc.v2)
		if err != nil {
			t.Errorf("Error parsing version: %s", err)
		}

		a := v1.LessThan(v2)
		e := tc.expected
		if a != e {
			t.Errorf(
				"Comparison of '%s' and '%s' failed. Expected '%t', got '%t'",
				tc.v1, tc.v2, e, a,
			)
		}
	}
}

func TestGreaterThan(t *testing.T) {
	tests := []struct {
		v1       string
		v2       string
		expected bool
	}{
		{"1.2.3", "1.5.1", false},
		{"2.2.3", "1.5.1", true},
		{"3.2-beta", "3.2-beta", false},
	}

	for _, tc := range tests {
		v1, err := NewVersion(tc.v1)
		if err != nil {
			t.Errorf("Error parsing version: %s", err)
		}

		v2, err := NewVersion(tc.v2)
		if err != nil {
			t.Errorf("Error parsing version: %s", err)
		}

		a := v1.GreaterThan(v2)
		e := tc.expected
		if a != e {
			t.Errorf(
				"Comparison of '%s' and '%s' failed. Expected '%t', got '%t'",
				tc.v1, tc.v2, e, a,
			)
		}
	}
}

func TestEqual(t *testing.T) {
	tests := []struct {
		v1       string
		v2       string
		expected bool
	}{
		{"1.2.3", "1.5.1", false},
		{"2.2.3", "1.5.1", false},
		{"3.2-beta", "3.2-beta", true},
		{"3.2-beta+foo", "3.2-beta+bar", true},
	}

	for _, tc := range tests {
		v1, err := NewVersion(tc.v1)
		if err != nil {
			t.Errorf("Error parsing version: %s", err)
		}

		v2, err := NewVersion(tc.v2)
		if err != nil {
			t.Errorf("Error parsing version: %s", err)
		}

		a := v1.Equal(v2)
		e := tc.expected
		if a != e {
			t.Errorf(
				"Comparison of '%s' and '%s' failed. Expected '%t', got '%t'",
				tc.v1, tc.v2, e, a,
			)
		}
	}
}
