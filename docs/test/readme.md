# Manual Testing

In this project we do manual testing with an approach that is called factor based testing (FBT)

## Process of Defining Test Sheets

A test sheet is defined for every test area. Typically a test area is a UI page.
The test area is examined. All actions and potential errors are grouped into test factors. (Take a look at the existing test sheets).

The test factors are divided into specific factors that apply only to the test area and common test factors that apply to all areas. Scratched factors will not be implemented in first release.

## Process of Testing

Pick a test sheet and study the specific and the common factors. The common factors are defined in a generic way. They might need some mental adaption to your test area.

Consider the test factors as a cheat-sheet or checklist. They should foster your creativity when doing tests. Think about combining multiple test factors in 'evil' test scenarios.


The factors do not define an expected outcome. This is intentional.
The following can help you to decide if the observed behavior is a bug:
* Compare it with other areas. It must be consistent within Dashboard.
* Compare it with other large websites like Gmail or Inbox. These sites follow common practices and match user expectation.

Dashboard is under constant development. Always enhance and adopt the sheets when doing tests. 

## Sheets

* [Deploy from file](deploy-from-file.md)
