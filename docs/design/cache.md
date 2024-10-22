# Table of Contents
- [Motivation](#motivation)
  - [Goals](#goals)
  - [Non-Goals](#non-goals)
  - [Terminology](#terminology)
- [Proposal](#proposal)
- [Design](#design)
- [Implementation](#implementation)

## Motivation
The Kubernetes Dashboard has been around for a long time now, and one of its pain points have always been the performance and responsiveness when running in clusters with a large number of resources. Given that, we have been thinking about implementing a proper API caching solution to enhance overall responsiveness and user experience. As clusters grow in size and complexity, users often face latency issues when interacting with the Dashboard, which can lead to inefficiencies in managing and troubleshooting applications. By implementing a proper caching solution, we can significantly reduce the time it takes to retrieve resource data, decrease peak memory usage and optimize overall resource consumption, thereby minimizing delays and improving the fluidity of the user interface.

### Goals
The primary goals of implementing the API caching solution are to:
- **Reduce Latency**: Minimize the time required to retrieve data from the Dashboard API during consecutive requests, enabling faster access to information.
- **Enhance User Experience**: Provide a smoother, more responsive interface for users managing complex clusters.
- **Optimize Resource Utilization**: Decrease the pressure on the Kubernetes API server by caching frequently accessed data, thus improving overall cluster performance.
- **Support Scalability**: Ensure the solution can accommodate clusters of varying sizes and complexities without degrading performance. Cache should be running in multi-cluster as well as in the single-cluster setup.
- **Configurability**: Provide opt-out and other configuration options.

### Non-Goals
This proposal does not aim to:

- **Replace Existing API Functionality**: The caching solution will transparently work with, not replace, the existing API endpoints and interactions.
- **Introduce Complexity for Users**: The implementation should remain transparent to users, avoiding any additional steps or configurations.
- **Cover All Resource Types Equally**: While the caching solution will enhance responsiveness, it may initially focus on the most frequently accessed resource types rather than attempting to cache every possible resource.

### Terminology
- **API Caching**: The process of storing responses from API requests temporarily to reduce the need for repeated fetching of the same data.
- **Resource**: An entity within Kubernetes, such as pods, services, deployments, etc., that users manage through the Dashboard.
- **Latency**: The time delay between a user action and the corresponding response from the system.

## Proposal
The proposed solution involves implementing a caching layer within the Kubernetes Dashboard that stores a configurable amount of API responses for a configurable duration. This caching layer will hook into Kubernetes client interfaces and serve cached data when available, falling back to the API server only when necessary. The solution will leverage techniques such as time and cost based expiration and cache invalidation strategies to ensure data freshness while balancing performance. 

In general, it will resemble the "cache-and-network" type of caching due to the nature of Dashboard auth layer. Since Dashboard does not require any permissions on its own, it has to rely on the user permissions and the only time when it can act as a user is the time from receiving a request to sending a response. Such an architecture requires an on-the-fly client creation as well as background cache updates.

In order to ensure that cached data will not be served to unauthorized entities, every time before API returns data from the cache, it will first create a Self Subject Access Review request to the API server in order to validate user permissions. 

It is especially important in a multi-cluster scenarios where Dashboard API is used to access multiple clusters. To avoid the situation where path stored in cache could be served from the wrong cluster context, multi-cluster cache context needs to have a way to exchange user authorization token for a unique context ID and it has to be a part of the cache key.

Cache key should consist of the below fields:
- **Kind**: a resource kind
- **Namespace**: optional namespace name
- **List Options**: `v1.ListOptions` should also be part of the key to ensure that filtered API requests are stored under a separate cache key
- **Context ID**: optional context id, used only in multi-context caching, controlled by dedicated argument

SHA should be created based on the above key structure and used as an internal cache key.

## Design
[//]: # (The design of the API caching solution consists of the following components:)

[//]: # ()
[//]: # (Cache Layer: A memory-based or distributed caching solution that stores API responses for quick retrieval.)

[//]: # (Request Interception: Middleware to intercept API requests and determine whether to serve cached data or make a fresh API call.)

[//]: # (Cache Configuration: Settings to define caching policies, including expiration times, resource types to cache, and invalidation triggers.)

[//]: # (Monitoring and Metrics: Tools to track cache hit/miss ratios, response times, and overall performance, enabling ongoing optimization.)

[//]: # (By implementing this design, the Kubernetes Dashboard can significantly improve its responsiveness, leading to a more efficient and enjoyable user experience.)

![Cache Sequence Diagram](../images/cache-sequence-diagram.png)

## Implementation
