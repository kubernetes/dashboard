# UX for Role-Based Access Control

This design document is a proposal for a Dashboard UI that
allows users to manage Roles, RolesBindings, ClusterRoles, and 
ClusterRoleBindings in an intuitive way. This document is a 
formalization of ideas and discussions from #1441.

## Background

Kubernetes now allows cluster admins to use 
[Role-Based Access Control](https://kubernetes.io/docs/admin/authorization/) to secure their clusters. 
Permissions are managed using the following Kubernetes Resources:
* Role
* ClusterRole
* RoleBinding
* ClusterRoleBinding

None of these are reflected in the current version of Dashboard UI. There should be a simplified, 
more user-friendly way to manage a cluster's access control by abstracting these raw concepts.


## Abstraction / Simplification

The only difference between Roles and ClusterRoles is that Roles apply to a specific namespace 
and ClusterRoles apply to all namespaces. The same is true for RoleBindings and ClusterRoleBindings. 
The UI should help users to understand these concepts and user flows should be designed to enforce
the correct usage. 

NOTE: The design proposed in this document will combine certain concepts:
* ClusterRoles will be referred to as Roles for the namespace "all namespaces"
* ClusterRoleBindings will be referred to as RoleBindings for the namespace "all namespaces"

## Use Cases

* Briefly introduce the concept of roles and bindings to the user
* Create a Role
* Bind subjects to a Role
* Edit a Role's rules
* Unbind a subject from a Role

# Design



## Overview

The overview can be reached by selecting the "Access Control" nav item in the admin section of the
left-hand nav. It shows existing Roles/Bindings, some important details for every item, and allows
the user to create a new Role or Role Binding right away. Tabs at the top can be used to switch 
between Roles and Role Bindings.

![Overview](mockups/21-11-2016-access-control/overview.png)

## Creating a Role

Clicking the "+ CREATE ROLE" button will display a form in the right section of the screen. 
After entering the name and selecting a Namespace ("All Namespaces" will create a ClusterRole),
the user can add rules to the Role by clicking "+ ADD RULE". Clicking "Create" will create the Role and select that 
Role from the list, displaying its details in the panel on the right.

![Overview](mockups/21-11-2016-access-control/create-role.png)

### Adding a Rule

A rule is a selection of API Groups, resource types and verbs. API Groups and resource types 
can be arbitrary strings. Entering "*" indicates references __all__ resource types / API groups.

![Overview](mockups/21-11-2016-access-control/new-rule.png)

## Bind Subjects to a Role

Clicking "+ CREATE ROLE BINDING" will open a dialog. After selecting the
target Role, adding subjects and selecting the Namespace ("All Namespaces" will create a ClusterRoleBinding), 
clicking "Create" will create the Role Binding and select that Role Binding from the list, displaying its details in the panel on the right.

NOTE: The existence of the subject entered by the user cannot be verified at the moment, so it is up to the 
user to make sure the entered information is correct.

![Overview](mockups/21-11-2016-access-control/create-binding.png)

## View a Role

By clicking on a list item in the overview, the user will be presented with a detail view.

![Overview](mockups/21-11-2016-access-control/view-role.png)

## Edit a Role

The only property of a Role that cannot be changed is its Namespace, because that determines
if the Role is a ClusterRole or not. Apart from that, the user may add and remove rules.

![Overview](mockups/21-11-2016-access-control/edit-role.png)

## Edit a Role Binding

Role Bindings can be edited by selecting them and selecting "EDIT". A modal will appear that lets the user 
edit the Role Binding's properties. Clicking "SAVE" will save the changes.

![Overview](mockups/21-11-2016-access-control/edit-role-binding.png)

# Open Questions
* How many Roles/Bindings can usually be found in a cluster (avg,min,max)?

# Credits
[Source code](mockups/21-11-2016-access-control/dashboard-rbac-ui.bmpr)
of the mockups.

Proposed by [@mlamina](https://github.com/mlamina).
