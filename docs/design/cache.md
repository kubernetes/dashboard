# Table of Contents
- [Motivation](#motivation)
  - [Goals](#goals)
  - [Non-Goals](#non-goals)
  - [Terminology](#terminology)
- [Proposal](#proposal)
- [Design](#design)
- [Implementation](#implementation)

## Motivation
The Kubernetes Dashboard has been around for a long time now and one of its pain points have always been the performance and responsiveness when running in clusters with a large number of resources. Given that, we have been thinking about implementing a proper caching solution to enhance overall responsiveness and user experience. As clusters grow in size and complexity, user often face latency issues when interacting with the Dashboard, which can lead to inefficiencies in managing and troubleshooting applications. By implementing a proper caching solution, we can significantly reduce time it takes to retrieve resource data, decrease peak memory usage and optimize overall resource consumption, thereby minimizing delays and improving the fluidity of the user interface.

### Goals
- Reduce load times during consecutive requests
- Reduce pressure on Kubernetes API server
- Provide opt-out and other configuration options
- Allow cache to be running in a multi-cluster setup 

### Non-Goals

### Terminology

## Proposal

## Design

## Implementation
