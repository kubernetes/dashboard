# Roadmap

![Roadmap](images/roadmap.png "Dashboard Roadmap")

The following table contains a priority-ordered list of work items and features the team
plans to work on (as of March 2016).

P0 items are considered blockers for next (`1.x`) release. All else is tackled on best effort basis.

|Area                         |Item                   |Relative priority        | Status |
|-----------------------------|-----------------------|-------------------------|--------|
|View cluster resources       |Next iteration of UX that scales for all Kubernetes resources and various use cases|P0||
|View cluster resources       |~~Handle Services - list and basic details view~~|P0|done|
|View cluster resources       |~~Handle Replica Sets - list and basic details view~~|P0|done|
|View cluster resources       |~~Handle Pods - list and basic details view~~|P0|done|
|View cluster resources       |~~Handle Deployments - list and basic details view~~|P0|done|
|View cluster resources       |~~Handle Daemon Sets - list and basic details view~~|P0|done|
|View cluster resources       |~~Handle Jobs - list and basic details view~~|P0|done|
|View cluster resources       |~~UI is aware of namespaces/tenants~~|P0|done|
|View cluster resources       |~~Handle Nodes - list and basic details view~~|P1|done|
|View cluster resources       |Show events for resources|P1|
|Monitoring/troubleshooting   |Sparklines/metrics/graphs for Nodes|P1|done|
|Monitoring/troubleshooting   |Sparklines/metrics/graphs for Containers|P1|
|Monitoring/troubleshooting   |Sparklines/metrics/graphs for Pods|P1|
|Monitoring/troubleshooting   |~~Surface errors/warnings for all resources shown~~|P1|done|
|Manage apps/resources        |~~YAML edit for resources displayed~~|P1|done|
|Manage apps/resources        |~~Delete support for resources displayed~~|P1|done|
|Create apps                  |Deploy form: migrate to Deployment objects|P1|
|Multi cluster (Ubernetes)    |Support multiple clusters in one UI|P1|
|Security/IAM                 |Make the UI securely accessible from outside of a cluster|P1|
|Security/IAM                 |Make the UI act on behalf of a user|P1|
|Security/IAM                 |IAM: don't crash/work correctly when IAM is enabled|P1|
|Cross-functional             |Analytics|P1|
|Cross-functional             |Internationalization|P1|
|Cross-functional             |"Send feedback"/"Report bug" capability|P1|
|Create apps                  |Plugin integration with deployment tools (such as helm, deployment manager or kpm)|P1|
|View cluster resources       |Show interconnections between resources: related resources, parents, children|P2|
|Create apps                  |Deploy form: autosuggest from a container registry (GCR, docker hub, etc.)|P2|
|Create apps                  |Deploy form: implement missing options (e.g., volumes, etc.)|P2|
|View cluster resources       |Show logs for controller resources (e.g., logs for all Pods of a Replica Set)|P2|
|View cluster resources       |Handle Pet Sets - list and basic details view|P2|
|View cluster resources       |Handle Containers - list and basic details view|P2|
|View cluster resources       |Handle Secrets - list and basic details view|P2|
|View cluster resources       |Handle Namespaces - list and basic details view|P2|
|View cluster resources       |Handle Ingress - list and basic details view|P2|
|Monitoring/troubleshooting   |Sparklines/metrics/graphs for Services|P2|
|Monitoring/troubleshooting   |Logs viewer: show logs for O(days) time period|P2|
|Monitoring/troubleshooting   |Logs viewer: handle large log files - O(GiB) in size|P2|
|Monitoring/troubleshooting   |Events viewer: handle large event streams - O(1k) events|P2|
|Multi cluster (Ubernetes)    |Native support of Ubernetes control plane: Dashboard can talk to it|P2|
|Security/IAM                 |IAM: support IAM as first class citzen (e.g., disable a button when cannot delete a resource)|P2|
|View cluster resources       |<other resources> - list and basic details view|P3|
|Monitoring/troubleshooting   |Sparklines/metrics/graphs for Replica Sets/Controllers/Deployments|P3|
|Monitoring/troubleshooting   |Logs viewer: aggregate logs across pods/containers/controllers|P3|
|Monitoring/troubleshooting   |Events viewer: aggregate events across pods/containers/controllers|P3|
|Manage apps/resources        |Custom edit views on resources|P3|
|Manage apps/resources        |Custom actions on specific resources (e.g., rollback on deployments)|P3|
|Multi cluster (Ubernetes)    |Advanced Ubernetes features: auto-spreading, migration between clusters|P3|
|Multi cluster (Ubernetes)    |Federated metrics|P4|
