# Replication controller details

## Prerequisites
Cluster with few deployed applications, where: 

* at least one is valid
* at least one is invalid (for example with wrong image) 

## Expected result
Page displays correctly, especially:

* tables with pods and events are available
* sidebar is available
* application details are valid and matching data from `kubectl` command
* all application actions are available
* warning events have warning icon nearby to their messages

## Specific factors

| Factor                        | 1                               | 2                       | 3                 | 4             | 5            | 6               | 7          | 8      | Comment                                                                               |
|-------------------------------|---------------------------------|-------------------------|-------------------|---------------|--------------|-----------------|------------|--------|---------------------------------------------------------------------------------------|
| Screen size                   | normal                          | mobile                  | narrow            | middle size   | wide         | active resizing |            |        |                                                                                       |
| Heapster                      | installed and running           | not installed           |                   |               |              |                 |            |        |                                                                                       |
| Pods count                    | 1                               | 1-10                    | more than 100     |               |              |                 |            |        |                                                                                       |
| Events count                  | 0                               | 0-10                    | more than 1000    |               |              |                 |            |        | events number can be changed for example by scaling replication controller pods count |
| Replication Controller status | valid state                     | invalid error state     |                   |               |              |                 |            |        |                                                                                       |
| Replication Controller age    | recently created                | few hours               | at least 24 hours |               |              |                 |            |        |                                                                                       |
| Replication Controller fields | normal                          | max length              | high pod count    |               |              |                 |            |        |                                                                                       |
| Table sorting                 | default                         | different columns       | upwards           | downwards     |              |                 |            |        | arrow near column header indicates sort order                                         |
| Events filtering              | default (all)                   | warning                 |                   |               |              |                 |            |        |                                                                                       |
| Actions                       | edit pod count                  | delete                  | display logs      |               |              |                 |            |        |                                                                                       |
| Edit pod count action         | negative                        | 0                       | 1                 |  less than 10 | more than 30 | empty           | scale down | cancel |                                                                                       |
| Delete action                 | default (with checkbox checked) | with checkbox unchecked | cancel            |               |              |                 |            |        |                                                                                       |
| Concurrency                   | delete replication controller   | edit pod count          |                   |               |              |                 |            |        |                                                                                       |

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
