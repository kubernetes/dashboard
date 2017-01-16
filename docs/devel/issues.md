# Introduction

This document describes Kubernetes Dashboard issues categorization and prioritization.

## Priorities

Kubernetes Dashboard uses labels to mark GitHub issues with priorities. Every issue should have assigned priority, absence of priority label means, that issue has not been checked yet. If you do not agree with assigned priority, then please notify about it.

### Priority labels

- `priority/P0` - critical issue, that must be resolved as soon as possible. Someone must be working on it. It can be broken build, crucial security issue or bug causing application crashes.
- `priority/P1` - important issue, that needs to be resolved before next release. It can be important feature or a bug, which is visible for users.
- `priority/P2` - issue, that should be resolved soon. It can be feature, bug or anything else, which is not top priority at the moment.
- `priority/P3` - lower priority issue, that will be resolved after issues with higher priority. It can be minor enhancement, which is not required at the moment.

## Categories

Kubernetes Dashboard uses labels to mark GitHub issues with categories. Every issue should be categorized, absence of category label means, that issue has not been checked yet. If you do not agree with assigned category, then please notify about it.

### Area labels

Issue area determines part of application or process connected to it. It can be API, documentation, internationalization, tests etc. Areas would be different for each application, Kubernetes Dashboard uses:

- `area/api` - issues connected to API of the Kubernetes Dasboard.
- `area/dev` - issues connected to development tools, processes and configuration.
- `area/docs` - issues connected to documentation of the Kubernetes Dashboard.
- `area/i8n` - issues connected to internationalization and localization.
- `area/performance` - issues connected to performance.
- `area/security` - issues connected to security and authorization.
- `area/setup` - issues connected to build and installation process of the Kubernetes Dashboard.
- `area/styling` - issues connected to styling of Kubernetes Dashboard.
- `area/tests` - issues connected to tests.
- `area/usability` - issues connected to general usability of Kubernetes Dashboard.
- `area/ux` - issues connected to user experience topics.
- `area/validation` - issues connected to form validation processes.

### Kind labels

Issue kind determines if issue is a bug, enhancement, feature, refactoring of existing code or if it covers changes in Kubernetes API. In contrast to area it is not connected to application itself. Following kinds could be applied to most of the applications.

- `kind/bug` - bugs, that need to be fixed. Assigned when something is not working as it was expected.
- `kind/duplicate` - duplicates of existing issues, that are usually closed and linked with original ones.
- `kind/enhancement` - enhancements of existing functionalities, that will make the application better.
- `kind/feature` - new features, that could be added to the application.
- `kind/question` - general discussions and user questions.
- `kind/refactoring` - issues created in order to enhance code quality without changing application functionality.

### CLA labels

Kubernetes Dashboard uses following two labels to mark pull requests. Every contributor needs to sign CLA before his change can be merged. Both labels are assigned automatically by @googlebot.

- `cla: yes` - CLA signed.
- `cla: no` - CLA not signed yet.

### Other labels

- `greenkeeper` - pull requests created by [greenkeeper.io bot](https://github.com/greenkeeperio-bot). This label is assigned automatically.
