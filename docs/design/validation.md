# Validation

## Problem
Kubernetes has restrictions for the possible values of resources. Therefore, Dashboard must
validate user input.

Please note: some input fields of Dashboard are used to create multiple resources in Kubernetes.
E.g. the app name input is used to create a replication controller, a label, a pod and optionally a
service. The Kubernetes value restrictions may not be aligned in all cases. Therefore, Dashboard may
need stronger validation rules that adjust to all created resources in Kubernetes. On the other hand
Dashboard must also accept resources which have been created without Dashboard (e.g. kubctl).

## Visualization
The error messages are displayed below each field. The message appears after the user has finished
his input.

The ok(submit) button of the form is always enabled. (The user perception of pressing the button is
that the complete form is validated and errors are shown. However, technically not much is happening as the validation is triggered on focus out implicitly. Only in case of async validations, the submit of the form must wait until all operation are completed.)


## Synchronous Validations
Checks on the import format (e.g required, max-length, pattern) are executed synchronously on
focus out.


## Asynchronous Validation
Validations that require a check in the backend (e.g. unique name checks) are executed
asynchronously on focus-out.

## Example
Example: https://accounts.google.com/SignUp?hl=en

## Implementation
* The validation rules are stored in the controller e.g. `ng-pattern="ctrl.inputPattern"`
* Add `novalidate` to the HTML form to disable HTML5-validations
