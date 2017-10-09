// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package logs

import (
	"strings"
)

// LINE_INDEX_NOT_FOUND is returned if requested line could not be found
var LINE_INDEX_NOT_FOUND = -1

// Default number of lines that should be returned in case of invalid request.
var DefaultDisplayNumLogLines = 100

// MaxLogLines is a number that will be certainly bigger than any number of logs. Here 2 billion logs is certainly much larger
// number of log lines than we can handle.
var MaxLogLines int = 2000000000

const (
	NewestTimestamp = "newest"
	OldestTimestamp = "oldest"
)

// Load logs from the beginning or the end of the log file.
// This matters only if the log file is too large to be loaded completely.
const (
	Beginning = "beginning"
	End       = "end"
)

// NewestLogLineId is the reference Id of the newest line.
var NewestLogLineId = LogLineId{
	LogTimestamp: NewestTimestamp,
}

// OldestLogLineId is the reference Id of the oldest line.
var OldestLogLineId = LogLineId{
	LogTimestamp: OldestTimestamp,
}

// Default log view selector that is used in case of invalid request
// Downloads newest DefaultDisplayNumLogLines lines.
var DefaultSelection = &Selection{
	OffsetFrom:      1 - DefaultDisplayNumLogLines,
	OffsetTo:        1,
	ReferencePoint:  NewestLogLineId,
	LogFilePosition: End,
}

// Returns all logs.
var AllSelection = &Selection{
	OffsetFrom:     -MaxLogLines,
	OffsetTo:       MaxLogLines,
	ReferencePoint: NewestLogLineId,
}

// Representation of log lines
type LogDetails struct {

	// Additional information of the logs e.g. container name, dates,...
	Info LogInfo `json:"info"`

	// Reference point to keep track of the position of all the logs
	Selection `json:"selection"`

	// Actual log lines of this page
	LogLines `json:"logs"`
}

// Meta information about the selected log lines
type LogInfo struct {

	// Pod name.
	PodName string `json:"podName"`

	// The name of the container the logs are for.
	ContainerName string `json:"containerName"`

	// The name of the init container the logs are for.
	InitContainerName string `json:"initContainerName"`

	// Date of the first log line
	FromDate LogTimestamp `json:"fromDate"`

	// Date of the last log line
	ToDate LogTimestamp `json:"toDate"`

	// Some log lines in the middle of the log file could not be loaded, because the log file is too large.
	Truncated bool `json:"truncated"`
}

// Selection of a slice of logs.
// It works just like normal slicing, but indices are referenced relatively to certain reference line.
// So for example if reference line has index n and we want to download first 10 elements in array we have to use
// from -n to -n+10. Setting ReferenceLogLineId the first line will result in standard slicing.
type Selection struct {
	// ReferencePoint is the ID of a line which should serve as a reference point for this selector.
	// You can set it to last or first line if needed. Setting to the first line will result in standard slicing.
	ReferencePoint LogLineId `json:"referencePoint"`
	// First index of the slice relatively to the reference line(this one will be included).
	OffsetFrom int `json:"offsetFrom"`
	// Last index of the slice relatively to the reference line (this one will not be included).
	OffsetTo int `json:"offsetTo"`
	// The log file is loaded either from the beginning or from the end. This matters only if the log file is too
	// large to be handled and must be truncated (to avoid oom)
	LogFilePosition string `json:"logFilePosition"`
}

// LogLineId uniquely identifies a line in logs - immune to log addition/deletion.
type LogLineId struct {
	// timestamp of this line.
	LogTimestamp `json:"timestamp"`
	// in case of timestamp duplicates (rather unlikely) it gives the index of the duplicate.
	// For example if this LogTimestamp appears 3 times in the logs and the line is 1nd line with this timestamp,
	// then line num will be 1 or -3 (1st from beginning or 3rd from the end).
	// If timestamp is unique then it will be simply 1 or -1 (first from the beginning or first from the end, both mean the same).
	LineNum int `json:"lineNum"`
}

// LogLines provides means of selecting log views. Problem with logs is that new logs are constantly added.
// Therefore the number of logs constantly changes and we cannot use normal indexing. For example
// if certain line has index N then it may not have index N anymore 1 second later as logs at the beginning of the list
// are being deleted. Therefore it is necessary to reference log indices relative to some line that we are certain will not be deleted.
// For example line in the middle of logs should have lifetime sufficiently long for the purposes of log visualisation. On average its lifetime
// is equal to half of the log retention time. Therefore line in the middle of logs would serve as a good reference point.
// LogLines allows to get ID of any line - this ID later allows to uniquely identify this line. Also it allows to get any
// slice of logs relatively to certain reference line ID.
type LogLines []LogLine

// A single log line. Split into timestamp and the actual content
type LogLine struct {
	Timestamp LogTimestamp `json:"timestamp"`
	Content   string       `json:"content"`
}

// LogTimestamp is a timestamp that appears on the beginning of each log line.
type LogTimestamp string

// SelectLogs returns selected part of LogLines as required by logSelector, moreover it returns IDs of first and last
// of returned lines and the information of the resulting logView.
func (self LogLines) SelectLogs(logSelection *Selection) (LogLines, LogTimestamp, LogTimestamp, Selection, bool) {
	requestedNumItems := logSelection.OffsetTo - logSelection.OffsetFrom
	referenceLineIndex := self.getLineIndex(&logSelection.ReferencePoint)
	if referenceLineIndex == LINE_INDEX_NOT_FOUND || requestedNumItems <= 0 || len(self) == 0 {
		// Requested reference line could not be found, probably it's already gone or requested no logs. Return no logs.
		return LogLines{}, "", "", Selection{}, false
	}
	fromIndex := referenceLineIndex + logSelection.OffsetFrom
	toIndex := referenceLineIndex + logSelection.OffsetTo
	lastPage := false
	if requestedNumItems > len(self) {
		fromIndex = 0
		toIndex = len(self)
		lastPage = true
	} else if toIndex > len(self) {
		fromIndex -= toIndex - len(self)
		toIndex = len(self)
		lastPage = logSelection.LogFilePosition == Beginning
	} else if fromIndex < 0 {
		toIndex += -fromIndex
		fromIndex = 0
		lastPage = logSelection.LogFilePosition == End
	}

	// set the middle of log array as a reference point, this part of array should not be affected by log deletion/addition.
	newSelection := Selection{
		ReferencePoint:  *self.createLogLineId(len(self) / 2),
		OffsetFrom:      fromIndex - len(self)/2,
		OffsetTo:        toIndex - len(self)/2,
		LogFilePosition: logSelection.LogFilePosition,
	}
	return self[fromIndex:toIndex], self[fromIndex].Timestamp, self[toIndex-1].Timestamp, newSelection, lastPage
}

// GetLineIndex returns the index of the line (referenced from beginning of log array) with provided logLineId.
func (self LogLines) getLineIndex(logLineId *LogLineId) int {
	if logLineId == nil || logLineId.LogTimestamp == NewestTimestamp || len(self) == 0 || logLineId.LogTimestamp == "" {
		// if no line id provided return index of last item.
		return len(self) - 1
	} else if logLineId.LogTimestamp == OldestTimestamp {
		return 0
	}
	logTimestamp := logLineId.LogTimestamp
	linesMatched := 0
	matchingStartedAt := 0
	for idx := range self { // todo use binary search to speedup log search (compare timestamps).
		if self[idx].Timestamp == logTimestamp {
			if linesMatched == 0 {
				matchingStartedAt = idx
			}
			linesMatched += 1
		} else if linesMatched > 0 {
			break
		}
	}
	var offset int
	if logLineId.LineNum < 0 {
		offset = linesMatched + logLineId.LineNum
	} else {
		offset = logLineId.LineNum - 1
	}
	if 0 <= offset && offset < linesMatched {
		return matchingStartedAt + offset
	} else {
		return LINE_INDEX_NOT_FOUND
	}
}

// CreateLogLineId returns ID of the line with provided lineIndex.
func (self LogLines) createLogLineId(lineIndex int) *LogLineId {
	logTimestamp := self[lineIndex].Timestamp
	// determine whether to use negative or positive indexing
	// check whether last line has the same index as requested line. If so, we can only use positive referencing
	// as more lines may appear at the end.
	// negative referencing is preferred as higher indices disappear later.
	var step int
	if self[len(self)-1].Timestamp == logTimestamp {
		// use positive referencing
		step = 1
	} else {
		step = -1
	}
	offset := step
	for ; 0 <= lineIndex-offset && lineIndex-offset < len(self); offset += step {
		if !(self[lineIndex-offset].Timestamp == logTimestamp) {
			break
		}
	}
	return &LogLineId{
		LogTimestamp: logTimestamp,
		LineNum:      offset,
	}
}

// ToLogLines converts rawLogs (string) to LogLines. Proper log lines start with a timestamp which is chopped off.
// In error cases the server returns a message without a timestamp
func ToLogLines(rawLogs string) LogLines {
	logLines := LogLines{}
	for _, line := range strings.Split(rawLogs, "\n") {
		if line != "" {
			startsWithDate := ('0' <= line[0] && line[0] <= '9') //2017-...
			idx := strings.Index(line, " ")
			if idx > 0 && startsWithDate {
				timestamp := LogTimestamp(line[0:idx])
				content := line[idx+1:]
				logLines = append(logLines, LogLine{Timestamp: timestamp, Content: content})
			} else {
				logLines = append(logLines, LogLine{Timestamp: LogTimestamp("0"), Content: line})
			}
		}
	}
	return logLines
}
