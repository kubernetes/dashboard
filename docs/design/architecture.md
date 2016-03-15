# Architecture 
Kubernetes Console project consists of two main components. They are called here the
frontend and the backend.

The frontend is a single page web application that runs in a browser. It fetches all its
business data from the backend using standard HTTP methods. It does not implement business logic;
it only presents fetched data and sends requests to the backend for actions.

The backend runs in a Kubernetes cluster as a kubernetes service. Alternatively, it may run anywhere
outside of the cluster, given that it can connect to the master. The backend is a HTTP server that
proxies data requests to appropriate remote backends (e.g., k8s apiserver or heapster) or implements
business logic. The backend implements business logic when remote backends APIs do not
support required use case directly, e.g., “get a list of pods with their CPU usage metric
timeline”. Figure 1 outlines the architecture of the project.

![Architecture Overview](architecture.png?raw=true "Architecture overview")

*Figure 1: Project architecture overview*

Rationale for having a backend that implements business logic:

* Clear separation between the presentation layer (frontend) and business logic layer (backend).
This is because every action goes through well defined API.
* Transactional actions are easier to implement on the backend than on the frontend. Examples of
such actions: "create a replication controller and a service for it" or "do a rolling update".
* Possible code reuse from existing tools (e.g., kubectl) and upstream contributions to the tools.
* Speed: getting composite data from backends is faster on the backend (if it runs close to the
data sources). For example, getting a list of pods with their CPU utilization timeline
requires at least two requests. Doing them on the backend shortens RTT.
