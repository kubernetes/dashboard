package chart

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"k8s.io/helm/pkg/chartutil"
	"k8s.io/helm/pkg/repo"
)

var (
	repositoryDir          string = "repository"
	repositoriesFilePath   string = "repositories.yaml"
	cachePath              string = "cache"
	localRepoPath          string = "local"
	localRepoIndexFilePath string = "index.yaml"
)

func homePath() string {
	return "/.helm"
}

func repositoryDirectory() string {
	return homePath() + "/" + repositoryDir
}

func cacheDirectory(paths ...string) string {
	fragments := append([]string{repositoryDirectory(), cachePath}, paths...)
	return filepath.Join(fragments...)
}

func cacheIndexFile(repoName string) string {
	return cacheDirectory(repoName + "-index.yaml")
}

func localRepoDirectory(paths ...string) string {
	fragments := append([]string{repositoryDirectory(), localRepoPath}, paths...)
	return filepath.Join(fragments...)
}

func repositoriesFile() string {
	return filepath.Join(repositoryDirectory(), repositoriesFilePath)
}

var (
	defaultRepository    = "kubernetes-charts"
	defaultRepositoryURL = "http://storage.googleapis.com/kubernetes-charts"
)

// ensureHome checks to see if $HELM_HOME exists
//
// If $HELM_HOME does not exist, this function will create it.
func ensureHome() error {
	configDirectories := []string{homePath(), repositoryDirectory(), cacheDirectory(), localRepoDirectory()}

	for _, p := range configDirectories {
		if fi, err := os.Stat(p); err != nil {
			fmt.Printf("Creating %s \n", p)
			if err := os.MkdirAll(p, 0755); err != nil {
				return fmt.Errorf("Could not create %s: %s", p, err)
			}
		} else if !fi.IsDir() {
			return fmt.Errorf("%s must be a directory", p)
		}
	}

	repoFile := repositoriesFile()
	if fi, err := os.Stat(repoFile); err != nil {
		fmt.Printf("Creating %s \n", repoFile)
		if _, err := os.Create(repoFile); err != nil {
			return err
		}
		if err := addRepo(defaultRepository, defaultRepositoryURL); err != nil {
			return err
		}
		// Add custom repos
		if err := addRepo("aia-repo", "http://172.19.29.166:8879/charts"); err != nil {
			return err
		}

	} else if fi.IsDir() {
		return fmt.Errorf("%s must be a file, not a directory", repoFile)
	}

	localRepoIndexFile := localRepoDirectory(localRepoIndexFilePath)
	if fi, err := os.Stat(localRepoIndexFile); err != nil {
		fmt.Printf("Creating %s \n", localRepoIndexFile)
		_, err := os.Create(localRepoIndexFile)
		if err != nil {
			return err
		}

		//TODO: take this out and replace with helm update functionality
		os.Symlink(localRepoIndexFile, cacheDirectory("local-index.yaml"))
	} else if fi.IsDir() {
		return fmt.Errorf("%s must be a file, not a directory", localRepoIndexFile)
	}

	fmt.Printf("$HELM_HOME has been configured at %s.\n", homePath())
	return nil
}

// locateChartPath looks for a chart directory in known places, and returns either the full path or an error.
func locateChartPath(name string) (string, error) {
	if _, err := os.Stat(name); err == nil {
		abs, err := filepath.Abs(name)
		if err != nil {
			return abs, err
		}
		return abs, nil
	}
	if filepath.IsAbs(name) || strings.HasPrefix(name, ".") {
		return name, fmt.Errorf("path %q not found", name)
	}

	crepo := filepath.Join(repositoryDirectory(), name)
	if _, err := os.Stat(crepo); err == nil {
		return filepath.Abs(crepo)
	}

	// Try fetching the chart from a remote repo into a tmpdir
	origname := name
	if filepath.Ext(name) != ".tgz" {
		name += ".tgz"
	}
	err := downloadChart(name, false, ".")
	if err == nil {
		lname, err := filepath.Abs(filepath.Base(name))
		if err != nil {
			return lname, err
		}
		log.Printf("Fetched %s to %s\n", origname, lname)
		return lname, nil
	}

	return name, fmt.Errorf("file %q not found: %s", origname, err)
}

// downloadChart fetches a chart over HTTP
//
// If untar is true, it also unpacks the file into untardir.
func downloadChart(pname string, untar bool, untardir string) error {
	r, err := repo.LoadRepositoriesFile(repositoriesFile())
	if err != nil {
		return err
	}
	log.Printf("Repos are : %s", r.Repositories)
	log.Printf("Pname is : %s", pname)

	// get download url
	u, err := mapRepoArg(pname, r.Repositories)
	if err != nil {
		return err
	}

	href := u.String()
	buf, err := fetchChart(href)
	log.Printf("Fetching chart from: %s", href)
	if err != nil {
		return err
	}

	return saveChart(pname, buf, untar, untardir)
}

// isTar tests whether the given file is a tar file.
//
// Currently, this simply checks extension, since a subsequent function will
// untar the file and validate its binary format.
func isTar(filename string) bool {
	return strings.ToLower(filepath.Ext(filename)) == ".tgz"
}

// saveChart saves a chart locally.
func saveChart(name string, buf *bytes.Buffer, untar bool, untardir string) error {
	if untar {
		return chartutil.Expand(untardir, buf)
	}

	p := strings.Split(name, "/")
	return saveChartFile(p[len(p)-1], buf)
}

// fetchChart retrieves a chart over HTTP.
func fetchChart(href string) (*bytes.Buffer, error) {
	buf := bytes.NewBuffer(nil)

	resp, err := http.Get(href)
	if err != nil {
		return buf, err
	}
	if resp.StatusCode != 200 {
		return buf, fmt.Errorf("Failed to fetch %s : %s", href, resp.Status)
	}

	_, err = io.Copy(buf, resp.Body)
	resp.Body.Close()
	return buf, err
}

// mapRepoArg figures out which format the argument is given, and creates a fetchable
// url from it.
func mapRepoArg(arg string, r map[string]string) (*url.URL, error) {
	// See if it's already a full URL.
	u, err := url.ParseRequestURI(arg)
	if err == nil {
		// If it has a scheme and host and path, it's a full URL
		if u.IsAbs() && len(u.Host) > 0 && len(u.Path) > 0 {
			return u, nil
		}
		return nil, fmt.Errorf("Invalid chart url format: %s", arg)
	}
	// See if it's of the form: repo/path_to_chart
	p := strings.Split(arg, "/")
	if len(p) > 1 {
		if baseURL, ok := r[p[0]]; ok {
			if !strings.HasSuffix(baseURL, "/") {
				baseURL = baseURL + "/"
			}
			return url.ParseRequestURI(baseURL + strings.Join(p[1:], "/"))
		}
		return nil, fmt.Errorf("No such repo: %s", p[0])
	}
	return nil, fmt.Errorf("Invalid chart url format: %s", arg)
}

func saveChartFile(c string, r io.Reader) error {
	// Grab the chart name that we'll use for the name of the file to download to.
	out, err := os.Create(c)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, r)
	return err
}
