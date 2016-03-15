# Introduction

This document describes Kubernetes Dashboard issues categorization and 
prioritization.

## Priorities

Kubernetes Dashboard uses labels to mark GitHub issues with priorities.
Every issue should have assigned priority, absence of priority label
means, that issue has not been checked yet. If you do not agree with
assigned priority, then please notify about it.

### Priority labels

- `priority/P0` - critical issue, that must be resolved as soon as
possible. Someone must be working on it. Broken build is a good example
of `priority/P0` issue.
- `priority/P1` - important issue, that needs to be resolved before next
release. It can be important feature or a bug, which is visible for
users.
- `priority/P2` - issue, that should be resolved soon. It can be
feature, bug or anything else, which is not top priority at the moment.
- `priority/P3` - lower priority issue, that will be resolved after
issues with higher priority. It can be minor enhancement, which is not
required at the moment.

## Categories

Kubernetes Dashboard uses labels to mark GitHub issues with categories.
Every issue should be categorized, absence of category label means, that
issue has not been checked yet. If you do not agree with assigned
category, then please notify about it.

### Area labels

- `area/api` - issues connected to API of the Kubernetes Dasboard.
- `area/dev` - issues connected to development tools, processes and
configuration.
- `area/docs` - issues connected to documentation of the Kubernetes
Dashboard.
- `area/i8n` - issues connected to internationalization and
localization.
- `area/install` - issues connected to build and installation process
of the Kubernetes Dashboard.
- `area/performance` - issues connected to performance.
- `area/styling` - issues connected to styling of Kubernetes Dashboard.
- `area/tests` - issues connected to tests.
- `area/usability` - issues connected to general usability of Kubernetes
Dashboard.
- `area/validation` - issues connected to form validation processes.

### Kind labels

- `kind/api change` - issues created in order cover API changes in
the Kubernetes.
- `kind/bug` - bugs, that need to be fixed.
- `kind/enhancement` - issues created in order to make the application
better.
- `kind/feature` - issues created in order to add new features to the
application.
- `kind/refactoring` - issues created in order to enhance code quality
without changing application functionality.

### CLA labels

Kubernetes Dashboard uses following two labels to mark pull requests.
Every contributor needs to sign CLA before his change can be merged.
Both labels are assigned automatically by @googlebot.

- `cla: yes` - CLA signed.
- `cla: no` - CLA not signed yet.

### Other labels

- `duplicate` -  duplicated issues, that are usually closed and linked
with original issue.
- `help wanted` - issues, where any contributions are appreciated.
- `invalid` - invalid issues. Not real bugs reported by users or issues
with invalid description.
- `missing details` - issues with missing details. Issue template should
be followed to avoid it.
- `question` - discussion issues and user questions.
- `wont fix` - issues, that will not be fixed.
