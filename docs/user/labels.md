# Labels

This document describes [labels](https://github.com/kubernetes/dashboard/labels) used across Kubernetes Dashboard repository.

## Kind

Labels used to determine issue kind.

* `kind/bug` - bugs, that need to be fixed. Assigned when something is not working as it was expected.
* `kind/cleanup` - issues created in order to enhance code quality without changing application functionality.
* `kind/documentation` - documentation, that need to be improved or updated.
* `kind/failing-test` - blocker of CI jobs, that should be fixed as soon as posible.
* `kind/feature` - new features, that could be added to the application.
* `kind/support` - issue that is a support question.

## Priority

Labels used to prioritize issues.

* `priority/critical-urgent` - critical issue, that must be resolved as soon as possible. Someone must be working on it. It can be broken build, crucial security issue or bug causing application crashes.
* `priority/important-soon` - important issue, that needs to be resolved before next release. It can be important feature or a bug, which is visible for users.
* `priority/important-longterm` - important issue, but it may need multiple releases to complete.
* `priority/backlog` - issue, that will be resolved after issues with higher priority. It can be minor enhancement, which is not required at the moment.
* `priority/awaiting-more-evidence` - lowest priority issue, possibly useful information, but not yet enough support to actually get it done.

## Lifecycle

Labels used to indicate status of issues.

* `lifecycle/active` - issues actively being worked on by a contributor.
* `lifecycle/frozen` - issues should not be auto-closed due to staleness.
* `lifecycle/rotten` - issues that has aged beyond stale and will be auto-closed.
* `lifecycle/stale` - issues has remained open with no activity and has become stale.

## Size

Labels used to describe an issue size.

* `size/XS`
* `size/S`
* `size/M`
* `size/L`
* `size/XL`
* `size/XXL`

## CLA

Labels used to determine if creator of pull request has signed the CNCF CLA. It has to be signed before change can be merged. Assigned automatically by @k8s-ci-robot.

`cncf-cla: yes` - pull requests from contributors with signed CNCF CLA.
`cncf-cla: no` - pull requests from contributors without signed CNCF CLA.

## Other

Other labels used for issues and pull requests.

* `area/dependency` - pull requests created by [Dependabot Preview](https://github.com/marketplace/dependabot-preview/) bot. This label is assigned automatically.
* `help wanted` - rather low priority issues, where any contributions are more than welcomed.
* `good first issue` - issues good for contributor onboarding.
* `missing details` - issues with missing details, that cannot be reproduced.
* `do-not-merge/hold` - pull requests, that should wait to merge temporarily.
* `do-not-merge/work-in-progress` - assigned automatically to pull requests with WIP in their title.
* `triage/duplicate` - duplicates, that should be closed and linked with original issues.
* `triage/needs-information` - issue needs more information in order to work on it.
* `triage/not-reproducible` - issue can not be reproduced as described.
* `triage/unresolved` - issue that can not or will not be resolved.

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
