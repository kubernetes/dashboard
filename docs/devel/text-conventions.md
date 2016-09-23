# Text conventions

The document describes the proper way to introduce new text to the Kubernetes Dashboard.

## Overview
Kubernetes Dashboard is a web-based user interface for Kubernetes clusters. It consists of multiple views like overview pages, list of resources and resource details pages. Much textual information is required within these elements. Let's consider sample dialog:

![Dashboard dialog](../dashboard-ui.png)

As you noticed there is a lot of different kinds of text messages in each view:

- titles
- headers
- labels
- values
- tooltips
- action button
- menu and navigation entries
- all kinds of messages including warnings, errors and help information

For each one of them developer has to take following decisions:

- Grammar - Using a verb in infinitive or gerund form?
- Punctuation - Using a period or not?
- Capitalization - Using capitalized words? Capitalize Kubernetes specific names?

In addition all text messages within Dashboard should be capitalized and it should be taken into consideration. For more details check our [localization guidelines](localization.md).

## General terms

### Grammar

Gerund form should be used everywhere. Exceptions are all kinds of messages including warnings, errors and help information.

### Punctuation

Depending on the type of a text resource, periods should be used at the end of sentences or not. Periods should be used within:

- all kinds of messages including warnings, errors and help information

Periods should be avoided within:

- headers
- titles
- labels
- values
- tooltips
- menu and navigation entries

### Capitalization

All kinds of the messages should have their first word capitalized. Exceptions are:

- names which appear in the middle of a message
- values and table contents

Moreover, Kubernetes specific names should be capitalized everywhere. It includes:

- application names - Kubernetes, Kubernetes Dashboard etc.
- resource names - Pod, Service, Endpoint, Node etc.