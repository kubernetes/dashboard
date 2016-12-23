# Deploy from settings

## Prerequisites
Open deploy dialog (+) and select "Specify app details below"

## Expected result at execution
* In positive case the "Deploy" button must lead to the creation of a running application
* Validation errors affecting particular fields must be displayed beneath these fields. In case the deployment  fails due to an exception, then a pop dialog is shown

## Specific factors

|Factor                    |1                                     |2                                  |3                                                        |4                                  |5                                            |Comment                                                                         |
|--------------------------|--------------------------------------|-----------------------------------|---------------------------------------------------------|-----------------------------------|---------------------------------------------|--------------------------------------------------------------------------------|
|App name                  |Max-length                            |Same name RC exists                |Same name RC does not exists and same name Service exists|Same name exists in other namespace|                                             |App name is used in the help text which does have some impact on layouting.     |
|Container image           |Max-length                            |With version                       |With hostname of registry                                |With port of registry              |                                             |                                                                                |
|Number of pods            |Floating point number                 |Not a number                       |Max-values                                               |                                   |                                             |                                                                                |
|Port                      |Border cases(1, 65535)                |Out of range(<0, >65535)           |Floating point number                                    |Not a number                       |Same port is mapped to different target ports|                                                                                |
|Protocol                  |TCP                                   |UDP                                |                                                         |                                   |                                             |                                                                                |
|Exporse service externally|local                                 |Without load-balancer (vagrant)    |With load-balancer (GCE)                                 |                                   |                                             |                                                                                |
|Description               |Max-length                            |                                   |                                                         |                                   |                                             |Description is mapped to 'metadata/annotations/description' for RC, Service, Pod|
|Labels                    |Max-length                            |key is empty and value is not empty|Key contains domain suffix                               |                                   |                                             |                                                                                |
|Namespace                 |Create Max-length namespace           |Create existing namespace          |                                                         |                                   |                                             |                                                                                |
|Image Pull Secret         |Create Max-length secret name         |Create existing secret name        |Data is not Base64 encoded                               |                                   |                                             |                                                                                |
|CPU requirement(cores)     |Floating point number                 |Not a number                       |> value of quota                                         |                                   |                                             |                                                                                |
|Memory requirement(MB)    |Floating point number                 |Not a number                       |> value of quota                                         |                                   |                                             |                                                                                |
|Run command               |Max-length                            |                                   |                                                         |                                   |                                             |                                                                                |
|Run command arguments     |Max-length                            |                                   |                                                         |                                   |                                             |                                                                                |
|Run as privileged         |                                      |                                   |                                                         |                                   |                                             |                                                                                |
|Environment variables     |Max-length                            |Key is empty and value is not empty|Value contains Environment variables                     |                                   |                                             |                                                                                |
|Action                    |Deploy                                |Cancel                             |                                                         |                                   |                                             |                                                                                |
|Concurrency explicitly    |Create same name app at the same time|                                   |                                                         |                                   |                                             |                                                                                |



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
