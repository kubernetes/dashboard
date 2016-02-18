# Deploy from file

## Prerequisites
Open deploy dialog (+) and select "Upload a YAML or JSON file"

## Expected result at execution
* In positive case the "Deploy" button must lead to the creation of a running application
* Validation errors affecting particular fields must be displayed beneath these fields. In case the deployment  fails due to an exception, then a pop dialog is shown

## Specific factors

| Factor       | 1                            | 2                      | 3                                           | 4                | 5            | 6                             | 7                       | Comment |
|--------------|------------------------------|------------------------|---------------------------------------------|------------------|--------------|-------------------------------|-------------------------|---------|
| File name    | Empty                        | Short                  | Max-length                                  |                  |              |                               |                         |         |
| File content | Correct YAML, e.g. Guestbook | Correct JSON           | Binary, e.g. PNG                            | Validation error | Syntax error | no RC, e.g. Only pod, svc,... | Special chars, e.g. XSS |         |
| Existence    | Empty cluster                | Deploy same file twice | One resource already exists, e.g. Namespace |                  |              |                               |                         |         |
| Action       | "Deploy"                     | "Cancel"               |                                             |                  |              |                               |                         |         |

## Common Factors

| Factor          | 1                          | 2                                | 3  | 4      |
|-----------------|----------------------------|----------------------------------|----|--------|
| Browser         | Chrome                     | Firefox                          | IE | Safari |
| Form            | Desktop                    | Mobile                           |    |        |
| Help            | Hover over every?          | Click on every "Learn more" link |    |        |
| Log entries     | check log entry on success | Check log entry on failure       |    |        |
| Success message | Shown for every action     |                                  |    |        |
| Failure message | Proper sentence            |                                  |    |        |
| Concurrency     | UI refreshes after error   |                                  |    |        |
