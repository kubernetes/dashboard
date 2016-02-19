# Replication controller list

## Prerequisites
Cluster with few deployed applications, where: 

* at least one is valid
* at least one is invalid (for example with wrong image) 

## Expected result
Page displays correctly, especially:

* cards are displayed correctly even when page is scaled down/up
* application details are valid and matching data from `kubectl` command
* logs menu display correct pods information
* all application actions are available
* invalid applications have warning symbols and error messages

## Specific factors

| Factor                               | 1                                                | 2                                             | 3                                        | 4                                       | 5                                                                 | 6                                                                   | Comment |
|--------------------------------------|--------------------------------------------------|-----------------------------------------------|------------------------------------------|-----------------------------------------|-------------------------------------------------------------------|---------------------------------------------------------------------|---------|
| Replication controller count on page | 1 replication controller on wide page            | 1 replication controller on narrow page       | 3 replication controller on on wide page | 3 replication controller on narrow page | Any other positive number of replication controllers on wide page | Any other positive number of replication controllers on narrow page |         |
| Replication controller status        | Valid                                            | Invalid (for example with not-existing image) |                                          |                                         |                                                                   |                                                                     |         |
| Replication controller data          | Image string length (short or too long for card) | Age                                           | Logs (with links)                        | Internal and external endpoints         | Number of running and desired pods                                | Labels                                                              |         |
| Actions                              | View details                                     | Edit pod count                                | Delete                                   | Logs                                    |                                                                   |                                                                     |         |
| Edit pod count action                | Non-positive value                               | 1                                             | Value less than 10                       | Value bigger than 30                    | String value                                                      | Empty field                                                         |         |
| Delete replication controller action | Okay button                                      | Cancel button                                 | Delete service checkbox checked          | Delete service checkbox not checked     |                                                                   |                                                                     |         |

## Common Factors

| Factor          | 1                          | 2                                | 3  | 4      |
|-----------------|----------------------------|----------------------------------|----|--------|
| Browser         | Chrome                     | Firefox                          | IE | Safari |
| Form            | Desktop                    | Mobile                           |    |        |
| Help            | Hover over every `?`       | Click on every `Learn more` link |    |        |
| Log entries     | check log entry on success | Check log entry on failure       |    |        |
| Success message | Shown for every action     |                                  |    |        |
| Failure message | Proper sentence            |                                  |    |        |
| Concurrency     | UI refreshes after error   |                                  |    |        |
