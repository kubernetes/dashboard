package chart

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"k8s.io/helm/cmd/helm/downloader"
	"k8s.io/helm/cmd/helm/helmpath"
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

var (
	stableRepository    = "kubernetes-charts"
	stableRepositoryURL = "http://storage.googleapis.com/kubernetes-charts"
	customRepository    = "ammeon-charts"
	customRepositoryURL = "http://172.19.29.166:8879/charts"
)

// ensureHome checks to see if $HELM_HOME exists
//
// If $HELM_HOME does not exist, this function will create it.
func ensureHome(home helmpath.Home) error {
	configDirectories := []string{home.String(), home.Repository(), home.Cache(), home.LocalRepository()}
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

	repoFile := home.RepositoryFile()
	if fi, err := os.Stat(repoFile); err != nil {
		fmt.Printf("Creating %s \n", repoFile)
		r := repo.NewRepoFile()
		r.Add(&repo.Entry{
			Name:  stableRepository,
			URL:   stableRepositoryURL,
			Cache: "stable-index.yaml",
		})
		if err := r.WriteFile(repoFile, 0644); err != nil {
			return err
		}
		cif := home.CacheIndex(stableRepository)
		if err := repo.DownloadIndexFile(stableRepository, stableRepositoryURL, cif); err != nil {
			fmt.Printf("WARNING: Failed to download %s: %s (run 'helm repo update')\n", stableRepository, err)
		}

		// TODO: Remove this and add custom chart repos, from an add repo dialog
		if err := addRepository(customRepository, customRepositoryURL, home); err != nil {
			return err
		}

	} else if fi.IsDir() {
		return fmt.Errorf("%s must be a file, not a directory", repoFile)
	}
	if r, err := repo.LoadRepositoriesFile(repoFile); err == repo.ErrRepoOutOfDate {
		fmt.Println("Updating repository file format...")
		if err := r.WriteFile(repoFile, 0644); err != nil {
			return err
		}
	}

	fmt.Printf("$HELM_HOME has been configured at %s.\n", homePath())
	return nil
}

func locateChartPath(name, version string, verify bool, keyring string) (string, error) {
	helmHome := helmpath.Home(homePath())
	name = strings.TrimSpace(name)
	version = strings.TrimSpace(version)
	if fi, err := os.Stat(name); err == nil {
		abs, err := filepath.Abs(name)
		if err != nil {
			return abs, err
		}
		if verify {
			if fi.IsDir() {
				return "", errors.New("cannot verify a directory")
			}
			if _, err := downloader.VerifyChart(abs, keyring); err != nil {
				return "", err
			}
		}
		return abs, nil
	}
	if filepath.IsAbs(name) || strings.HasPrefix(name, ".") {
		return name, fmt.Errorf("path %q not found", name)
	}

	crepo := filepath.Join(helmHome.Repository(), name)
	if _, err := os.Stat(crepo); err == nil {
		return filepath.Abs(crepo)
	}

	dl := downloader.ChartDownloader{
		HelmHome: helmHome,
		Out:      os.Stdout,
		Keyring:  keyring,
	}
	if verify {
		dl.Verify = downloader.VerifyAlways
	}

	filename, _, err := dl.DownloadTo(name, version, ".")
	if err == nil {
		lname, err := filepath.Abs(filename)
		if err != nil {
			return filename, err
		}
		fmt.Printf("Fetched %s to %s\n", name, filename)
		return lname, nil
	}

	return filename, fmt.Errorf("file %q not found", name)
}
