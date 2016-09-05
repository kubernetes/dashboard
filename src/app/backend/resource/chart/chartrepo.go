package chart

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"

	"gopkg.in/yaml.v2"
	"k8s.io/helm/pkg/repo"
)

// RepositorySpec is a specification for a repository.
type RepositorySpec struct {
	// Name of the chart.
	RepoName string `json:"repoName"`

	// Name of the release.
	RepoUrl string `json:"repoUrl"`
}

// RepositoryListSpec is a specification for a repository.
type RepositoryListSpec struct {
	// List of repository names.
	RepoNames []string `json:"repoNames"`
}

// RepositoryListSpec is a specification for a repository.
type RepositoryChartListSpec struct {
	// List of charts.
	Charts []ChartSpec `json:"chartNames"`
}

// Chartspec representation view of a chart.
type ChartSpec struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	FullName    string `json:"fullName"`
	Description string `json:"description"`
}

// AddRepository adds a repository.
func AddRepository(spec *RepositorySpec) error {
	return addRepo("aia-repo", "http://172.19.29.166:8879/charts")
}

// GetRepositoryList get a list of repository.
func GetRepositoryList() (*RepositoryListSpec, error) {
	repoList := &RepositoryListSpec{
		RepoNames: make([]string, 0),
	}
	repoList.RepoNames = append(repoList.RepoNames, "k8s-charts")
	return repoList, nil
}

// GetRepositoryCharts get charts in a repository.
func GetRepositoryCharts(repoName string) (*RepositoryChartListSpec, error) {
	chartList := &RepositoryChartListSpec{}
	// chartList.ChartNames = append(chartList.ChartNames, "chart1")
	return chartList, nil
}

func index(dir, url string) error {
	chartRepo, err := repo.LoadChartRepository(dir, url)
	if err != nil {
		return err
	}
	return chartRepo.Index()
}

func addRepo(name, url string) error {
	if err := repo.DownloadIndexFile(name, url, cacheIndexFile(name)); err != nil {
		return errors.New("Looks like " + url + " is not a valid chart repository or cannot be reached: " + err.Error())
	}

	return insertRepoLine(name, url)
}

func removeRepoLine(name string) error {
	r, err := repo.LoadRepositoriesFile(repositoriesFile())
	if err != nil {
		return err
	}

	_, ok := r.Repositories[name]
	if ok {
		delete(r.Repositories, name)
		b, err := yaml.Marshal(&r.Repositories)
		if err != nil {
			return err
		}
		if err := ioutil.WriteFile(repositoriesFile(), b, 0666); err != nil {
			return err
		}
		if err := removeRepoCache(name); err != nil {
			return err
		}

	} else {
		return fmt.Errorf("The repository, %s, does not exist in your repositories list", name)
	}

	return nil
}

func removeRepoCache(name string) error {
	if _, err := os.Stat(cacheIndexFile(name)); err == nil {
		err = os.Remove(cacheIndexFile(name))
		if err != nil {
			return err
		}
	}
	return nil
}

func insertRepoLine(name, url string) error {
	f, err := repo.LoadRepositoriesFile(repositoriesFile())
	if err != nil {
		return err
	}
	_, ok := f.Repositories[name]
	if ok {
		return fmt.Errorf("The repository name you provided (%s) already exists. Please specify a different name.", name)
	}

	if f.Repositories == nil {
		f.Repositories = make(map[string]string)
	}

	f.Repositories[name] = url

	b, _ := yaml.Marshal(&f.Repositories)
	return ioutil.WriteFile(repositoriesFile(), b, 0666)
}
