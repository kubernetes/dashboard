# Application Debugging

This design document is a proposal to consolidate add simple application
debugging features in Dashboard UI.

## Background

The Kubernetes command line interface has several features for inspecting
applications running in Pods. Some examples are as follows.

- Viewing application logs (kubectl logs)
- Attaching to a running container (kubectl attach)
- Executing a process in a container and optionally opening a terminal session
  (kubectl exec)
- Port forwarding to a container (kubectl port-forward)
- Creating a proxy to the Kubernetes API server (kubectl proxy)

Troubleshooting and debugging have consistently been a top priority from a users point of view. See:

- [Kubernetes UI Survey Nov 2016](https://github.com/kubernetes/dashboard/blob/master/docs/devel/images/kubecon-dashboard-survey-infographic-nov2016.png)
- [Kubernetes UI Survey Nov 2017](http://blog.kubernetes.io/2017/01/kubernetes-ux-survey-infographic.html)

## Problem Statement

- Update the UI to be closer to feature parity with the CLI
  - Allow users to execute process in containers running in pods and open a
    terminal session.
  - Allow users to attach to applications running in the container.
  - Improve the UI so that debugging functions are easier to find and use.
  - Port forwarding and proxying to the API server will be out of scope

## Design

The basis of the design is adding two new features and rearranging existing
features in the UI so that debugging features are logically grouped.

- Exec into Pod: Allow users to execute a command in a container and attach a
  terminal to it from the UI.
- Attach to Pod: Allow users to attach to their existing process running in a
  container.
- UI Improvements: Logically group the Exec Into Pod, Attach to Pod, and Logs
  viewer features together with Pod details to allow for smoother debugging.

### Exec into Pod

#### Similar Features in Other UIs

### Attach to Pod

### UI Improvements


TODO: OpenShift etc.

sudo docker run -d --name "origin" \
        --privileged --pid=host --net=host \
        -v /:/rootfs:ro -v /var/run:/var/run:rw -v /sys:/sys -v /var/lib/docker:/var/lib/docker:rw \
        -v /var/lib/origin/openshift.local.volumes:/var/lib/origin/openshift.local.volumes:rslave \
        openshift/origin start
