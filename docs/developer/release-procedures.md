# Release procedures

## Official releases

After significant improvements have been done it is worth to release a new version. In order to do so just follow the steps described below:

1. Test everything twice on Docker image and `npm run start:prod`.
2. Send a pull request that increases version numbers in all files. Follow versioning guidelines. Files to keep in sync are listed below:
    * `package.json` and `package-lock.json`
    * `RELEASE_VERSION` in `Makefile`
    * YAML files from `aio/deploy`
    * Helm Chart from `aio/deploy/helm-chart/kubernetes-dashboard`: `image.tag` of `README.md` and `values.yaml`, `version` and `appVersion` of `Chart.yaml`
3. Get the pull request reviewed and merged.
4. Create a git [release](https://github.com/kubernetes/dashboard/releases/) tag for the merged pull request. Release description should include a changelog.
5. Update add-ons on the [Kubernetes](https://github.com/kubernetes/kubernetes/tree/master/cluster/addons/dashboard) repository. If the update is minor, all that needs to be done is to change image version number in the main controller config file (`dashboard-controller.yaml`), and other configs, as described in the header of the config. If the release is major, this needs coordination with Kubernetes core team and possibly alignment with the schedule of the core.
6. Update addon config in the [minikube](https://github.com/kubernetes/minikube/tree/master/deploy/addons) repository.
7. Update addon config in the [kops](https://github.com/kubernetes/kops/tree/master/addons/kubernetes-dashboard) repository.
8. Release Helm Chart by running the `aio/scripts/helm-release-chart.sh` script from the newly created git tag, then push the git `gh-pages` branch of your `https://github.com/kubernetes/dashboard/` git remote.

Official release procedures are done by CI after successful TAG build automatically, that are pushed to [`kubernetesui/dashboard*`](https://hub.docker.com/u/kubernetesui) repositories.

### Versioning guidelines

Kubernetes Dashboard versioning follows [semver](https://semver.org/) in spirit. This means that it uses `vMAJOR.MINOR.PATCH` version numbers, but uses UX and consumer-centric approach for incrementing version numbers.

1. Increment MAJOR when there are breaking changes that affect user's workflows or the UX gets major redesign.
2. Increment MINOR when new functionality is added or there are minor UX changes.
3. Increment PATCH in case of bug fixes and minor new features.

Versions `0.X.Y` are reserved for initial development and may not strictly follow the guidelines.

## Development releases

There is no need to do anything at all after everything was set up and now the whole process is automated.

On every successful master build CI provides development releases, that are pushed to [`kubernetesdashboarddev/dashboard*`](https://hub.docker.com/u/kubernetesdashboarddev) repositories. Each build produces one image for each architecture. The images are tagged with `head`.

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
