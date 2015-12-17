# Validation

## Problem
Kubernetes has restrictions for the possible values of input fields, e.g. maximum input length.
Input errors are displayed below each field.

## Goals
* Good usability
* Reduce amount of unit tests to be written

## Basic Validations
The standard angular and material validation rules are used, e.g.:
* md-maxlength
* ng-pattern
* required (only if touched)

## Implementation
* The value of the properties should be stored in the controller e.g. `ng-pattern="ctrl.inputPattern"`
* Add `novalidate` to the HTML form to disable HTML5-validations
