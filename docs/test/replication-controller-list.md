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

| Factor                               | 1                            | 2                                   | 3               | 4            | 5               | 6                         | 7          | 8      | Comment                                                                                     |
|--------------------------------------|------------------------------|-------------------------------------|-----------------|--------------|-----------------|---------------------------|------------|--------|---------------------------------------------------------------------------------------------|
| Replication controller count on page | 1                            | odd                                 | even            | 20-30        |                 |                           |            |        |                                                                                             |
| Screen size                          | normal                       | mobile                              | narrow          | wide         | active resizing |                           |            |        |                                                                                             |
| Replication controller status        | valid state                  | error state                         |                 |              |                 |                           |            |        | error increases height of the card, error state can be caused by setting non-existing image |
| Replication controller fields        | normal                       | max length                          | hight pod count |              |                 |                           |            |        |                                                                                             |
| Replication controller labels        | normal                       | long text (253 prefix and 63 label) | 1               | odd          | even            | short and long text mixed | 20-30      |        | labels increase height of the card                                                          |
| Actions                              | view details                 | edit pod count                      | delete          | display logs |                 |                           |            |        |                                                                                             |
| Edit pod count                       | negative                     | 0                                   | 1               | less than 10 | more than 30    | empty                     | scale down | cancel |                                                                                             |
| Delete replication controller action | normal                       | with checkbox checked               | cancel          |              |                 |                           |            |        |                                                                                             |
| Concurrency                          | delete repication controller | edit pod count                      |                 |              |                 |                           |            |        |                                                                                             |

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
