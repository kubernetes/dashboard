# Introduction
This document describes labels used across Kubernetes Dashboard. 

## Kind
Labels used to determine issue kind.

- `kind/bug` - bugs, that need to be fixed. Assigned when something is not working as it was expected.
- `kind/discussion` - general discussions and user questions.
- `kind/enhancement` - enhancements of existing functionalities, that will make the application better.
- `kind/feature` - new features, that could be added to the application.
- `kind/refactoring` - issues created in order to enhance code quality without changing application functionality.

## Priority
Labels used to prioritize issues.

- `priority/P0` - critical issue, that must be resolved as soon as possible. Someone must be working on it. It can be broken build, crucial security issue or bug causing application crashes.
- `priority/P1` - important issue, that needs to be resolved before next release. It can be important feature or a bug, which is visible for users.
- `priority/P2` - issue, that should be resolved soon. It can be feature, bug or anything else, which is not top priority at the moment.
- `priority/P3` - lower priority issue, that will be resolved after issues with higher priority. It can be minor enhancement, which is not required at the moment.

## CLA
Labels used to determine if creator of pull request has signed the CLA. It has to be signed before change can be merged. Assigned automatically by @googlebot and @k8s-ci-robot.

- `cla: yes` and `cncf-cla: yes` - pull requests from contributors with signed CLA.
- `cla: no` and `cncf-cla: no` - pull requests from contributors without signed CLA.

## Other
Other labels used for issues and pull requests.

- `cluster-issue` - issues related to cluster configuration or cluster itself. These issues will not be fixed on Dashboard's side.
- `duplicate` - duplicates, that should be closed and linked with original issues.
- `greenkeeper` - pull requests created by [greenkeeper.io bot](https://github.com/greenkeeperio-bot). This label is assigned automatically.
- `help-wanted` - issues good for contributor onboarding.
- `missing-details` - issues with missing details, that cannot be reproduced.
