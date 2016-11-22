# UX for role-based access control

This design document is a proposal for a Dashboard UI that
allows users to manage Roles, RolesBindings, ClusterRoles, and 
ClusterRoleBindings in an intuitive way. This document is a 
formalization of ideas and discussions from #1441.

## Background

Kubernetes now allows cluster admins to use 
[role-based access control](http://kubernetes.io/docs/admin/authorization/) to secure their clusters. 
Permissions are managed using the following Kubernetes Resources:
* Role
* ClusterRole
* RoleBinding
* ClusterRoleBinding

None of these are reflected in the current version of Dashboard UI.

## Problem statement

* The UI should be a simplified, more user-friendly way to manage a cluster's 
access control by abstracting the raw concepts of Roles, RolesBindings, 
ClusterRoles, and ClusterRoleBindings

# Design

TBD

## Navigation

TBD

## View templates

TBD

## Future work

TBD
## Concrete pages

TBD

## Credits
[Source code](mockups/21-11-2016-access-control/dashboard-rbac-ui.bmpr)
of the mockups.

Proposed by [@mlamina](https://github.com/mlamina).