# metrics

Kubernetes metrics API type definitions and clients.

## Purpose

This repository contains type definitions and client code for the metrics
APIs that Kubernetes makes use of.  Depending on the API, the actual
implementations live elsewhere.

Consumers of the metrics APIs can make use of this repository to access
implementations of the APIs, while implementors should make use of this
library when implementing their API servers.

## APIs

This repository contains (or will contain) types and clients for the
following APIs:

### Custom Metrics API

**[Coming Soon]**

This API allows consumers to access arbitrary metrics which describe
Kubernetes resources.

The API is intended to be implemented by monitoring pipeline vendors, on
top of their metrics storage solutions.

Import Path: `k8s.io/metrics/pkg/apis/custom_metrics`.

## Compatibility

The APIs in this repository follow the standard guarantees for Kubernetes
APIs, and will follow Kubernetes releases.

## Community, discussion, contribution, and support

Learn how to engage with the Kubernetes community on the [community
page](http://kubernetes.io/community/).

You can reach the maintainers of this repository at:

- Slack: #sig-instrumention (on https://kubernetes.slack.com -- get an
  invite at slack.kubernetes.io)
- Mailing List:
  https://groups.google.com/forum/#!forum/kubernetes-sig-instrumentation

### Code of Conduct

Participation in the Kubernetes community is governed by the [Kubernetes
Code of Conduct](code-of-conduct.md).

### Contibution Guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.
