# Dashboard Codebase Structure (For New Contributors)

**Note: This document reflects the structure of the dashboard as of version 1.6.x and may not reflect the structure of previous or future dashboard versions**

An overview of the features provided by the dashboard can be found here:
https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/

If you're looking for ideas on what to contribute, in addition to taking a look at issues with the `help-wanted` tag, you may also want to view the [dashboard roadmap](roadmap.md)

### Overall
- Kube dashboard is split into a *backend api* and a *frontend app*. The api is located in the backend folder and the frontend is located in the frontend folder in the `src` directory.

### Backend (API)
- Every api call hits `apihandler.go` which implements a series of handler functions to pass the results to resource-specific handlers.

- The dashboard backend currently doesn't implement a cache, so calls to the dashboard api will always make fresh calls to the kubernetes apiserver.

- The backend is written in [Golang](https://golang.org/).

### Frontend
- The frontend makes calls to the api and renders received data. The frontend also transforms some data on the client and provides visualizations for the user. The frontend also makes calls to the api server to do things like exec into a container directly from the dashboard.

- The frontend also automatically generates localized translations. You can generate translations manually by running `gulp generate-xtbs` or `gulp serve:prod`. Take a look at the [localization guide](localization.md) and [text conventions](text-conventions.md) for more info.

- The frontend uses [angular](https://angular.io/), a javascript model-view-controller framework along with [material design](https://material.angularjs.org/latest/getting-started) for cards, components, search bars, and all other visuals.

- [Material design guidelines](https://material.io/guidelines/)

- Production javascript is compiled via [google closure compiler](https://developers.google.com/closure/compiler/), so please make sure all functions and variables are properly type annotated.

- **Always run `gulp serve:prod` at least once before submitting a pull request**

### Tests
- The frontend tests can be found in the `src/test/` directory. That test directory is structured to mirror the `/src/app` directory.

- The backend tests can be found in the same directory as their source files in `src/app/backend`.

If you have any further questions, feel free to ask in `#sig-ui` on the [kubernetes slack channel](http://slack.k8s.io/).
