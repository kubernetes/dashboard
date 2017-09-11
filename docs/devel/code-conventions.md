# Code conventions

The document describes the proper way to introduce new code to the Kubernetes Dashboard.

## Tooltips

In order to keep all tooltips consistent across whole application, we have decided to use 500 ms delay and auto-hide
option. It allows us to avoid flickering when moving mouse over the pages and to hide tooltips after mouse is
elsewhere but focus is still on the element with tooltip.

Sample code:

``` html
<md-tooltip md-delay="500" md-autohide>
   ...
</md-tooltip>
```
