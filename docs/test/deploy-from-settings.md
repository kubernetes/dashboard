# Deploy from settings

## Prerequisites
Open deploy dialog (+) and select "Specify app details below"

## Expected result at execution
* In positive case the "Deploy" button must lead to the creation of a running application
* Validation errors affecting particular fields must be displayed beneath these fields. In case the deployment  fails due to an exception, then a pop dialog is shown

## Specific factors

|Factor                      |1                 |2                                 |3               |4               |5                        |6                    |7               |Comment|
|----------------------------|------------------|----------------------------------|----------------|----------------|-------------------------|---------------------|----------------|-------|
|App name                    |Empty             |Correct value                     |Max-length      |Validation error|Same name app exists     |                     |                |       |
|Container image             |Empty             |Correct value                     |Max-length      |With version    |With hostname of registry|With port of registry|Validation error|       |
|Number of pods              |0                 |Positive integer                  |Negative integer|Not integer     |Not a number             |                     |                |       |
|Port                        |0                 |Positive integer                  |Negative integer|Not integer     |Not a number             |                     |                |       |
|Target Port                 |0                 |Positive integer                  |Negative integer|Not integer     |Not a number             |                     |                |       |
|Protocol                    |TCP               |UDP                               |                |                |                         |                     |                |       |
|Expose service externally   |Checked           |Not checked                       |                |                |                         |                     |                |       |
|Description                 |Empty             |Correct value                     |Max-length      |Validation error|                         |                     |                |       |
|Key(Labels)                 |Empty             |Correct value                     |Max-length      |Validation error|Existing key             |                     |                |       |
|Value(Labels)               |Empty             |Correct value                     |Max-length      |Validation error|                         |                     |                |       |
|Namespace                   |Existing namespace|Select "Create a new namespace..."|                |                |                         |                     |                |       |
|Image Pull Secret           |Existing secret   |Select "Create a new secret..."   |                |                |                         |                     |                |       |
|CPU requirement(cores)      |0                 |Positive integer                  |Negative integer|Not integer     |Not a number             |                     |                |       |
|Memory requirement(MB)      |0                 |Positive integer                  |Negative integer|Not integer     |Not a number             |                     |                |       |
|Run command                 |Empty             |Correct value                     |Max-length      |Validation error|                         |                     |                |       |
|Run command arguments       |Empty             |Correct value                     |Max-length      |Validation error|                         |                     |                |       |
|Run as privileged           |Checked           |Not checked                       |                |                |                         |                     |                |       |
|Key(Environment variables)  |Empty             |Correct value                     |Max-length      |Validation error|Existing key             |                     |                |       |
|Value(Environment variables)|Empty             |Correct value                     |Max-length      |Validation error|                         |                     |                |       |
|Action                      |Deploy            |Cancel                            |                |                |                         |                     |                |       |



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
