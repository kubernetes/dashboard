# Logs

## Prerequisites
Cluster with few deployed applications, where: 

* at least one is valid
* at least one is invalid (for example with wrong image) 

## Expected result
Page displays correctly, especially:

* toolbar is displayed correctly
* logs are displayed correctly

## Specific factors

| Factor                        | 1               | 2                   | 3            | 4           | 5    | 6               | 7 | 8 | Comment |
|-------------------------------|-----------------|---------------------|--------------|-------------|------|-----------------|---|---|---------|
| Screen size                   | normal          | mobile              | narrow       | middle size | wide | active resizing |   |   |         |
| Pods count                    | 1               | odd                 | even         | 20-30       |      |                 |   |   |         |
| Container count               | 0               | 0-10                | more than 10 |             |      |                 |   |   |         |
| Replication Controller status | valid state     | invalid error state |              |             |      |                 |   |   |         |
| Page style                    | default (light) | dark                |              |             |      |                 |   |   |         |
| Actions                       | switching pods  | switchings pods     |              |             |      |                 |   |   |         |

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
