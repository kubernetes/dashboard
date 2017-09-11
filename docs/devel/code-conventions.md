# Code conventions

The document describes the proper way of introducing new code to the Kubernetes Dashboard.

## Backend

We are following conventions described in [Effective Go](https://golang.org/doc/effective_go.html) document.

Go to our [Go Report Card](https://goreportcard.com/report/github.com/kubernetes/dashboard) to check how well
we are doing.

## Frontend

We are following conventions described in 
[Angular 1 Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md).

Check following subsections for more rules and tips.

### Naming conventions

Here is a list of rules, that we follow:

- self-explanatory names
- private method and variable names should end with a `_`
 
Please notice, that this is not a list of all common programming rules. Use it as a list of tips designed for this
project.

### JavaScript Annotations

We are using [Closure Compiler](https://developers.google.com/closure/compiler/) and therefore we need to match few
requirements. One of them is proper usage of annotations which is described 
[here](https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler).

### Tooltips

In order to keep all tooltips consistent across whole application, we have decided to use 500 ms delay and auto-hide
option. It allows us to avoid flickering when moving mouse over the pages and to hide tooltips after mouse is
elsewhere but focus is still on the element with tooltip.

Sample code:

``` html
<md-tooltip md-delay="500" md-autohide>
   ...
</md-tooltip>
```
