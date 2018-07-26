## Backend

We are following conventions described in [Effective Go](https://golang.org/doc/effective_go.html) document.

Go to our [Go Report Card](https://goreportcard.com/report/github.com/kubernetes/dashboard) to check how well
we are doing.

## Frontend

We are following conventions described in [Angular 1 Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md) and [Material Design Guidelines](https://material.io/guidelines/).

Additionally, check the list of rules and tips, that we are using:

- Private method and variable names should end with a `_`.
- In order to keep all tooltips consistent across whole application, we have decided to use 500 ms delay and auto-hide option. It allows us to avoid flickering when moving the mouse over the pages and to hide tooltips after the mouse is elsewhere but the focus is still on the element with tooltip.

An overview of the features provided by the dashboard can be found [here](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard)

If you're looking for ideas on what to contribute, in addition to taking a look at issues with the `help-wanted` tag, you may also want to view the [Dashboard roadmap](https://github.com/kubernetes/dashboard/wiki/Roadmap)..

If you have any further questions, feel free to ask in `#sig-ui` on the [Kubernetes' Slack](https://kubernetes.slack.com).