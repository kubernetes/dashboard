// Copyright 2015 Google Inc. All Rights Reserved.
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

// Logs is a representation of logs response structure.
type Logs struct {
	// Pod name.
	PodId string `json:"podId"`

	// Logs string lines.
	LogLines `json:"logs"`

	// The name of the container the logs are for.
	Container string `json:"container"`

	// Reference of the first log line in LogLines
	FirstLogLineReference LogLineId `json:"firstLogLineReference"`

	// Reference of the last log line in LogLines
	LastLogLineReference LogLineId `json:"lastLogLineReference"`

	// Structure holding information about current log view
	LogViewInfo `json:"logViewInfo"`
}

// Number that is returned if requested line could not be found
var LINE_INDEX_NOT_FOUND = -1

// Default number of lines that should be returned in case of invalid request.
var DefaultDisplayNumLogLines = 100

// MaxLogLines is a number that will be certainly bigger than any number of logs. Here 2 billion logs is certainly much larger
// number of log lines than we can handle.
var MaxLogLines int = 2000000000

// Default log view selector that is used in case of invalid request
// Downloads newest DefaultDisplayNumLogLines lines.
var DefaultLogViewSelector = &LogViewSelector{
	RelativeFrom:       1 - DefaultDisplayNumLogLines,
	RelativeTo:         1,
	ReferenceLogLineId: NewestLogLineId,
}

// Returns all logs.
var AllLogViewSelector = &LogViewSelector{
	RelativeFrom:       -MaxLogLines,
	RelativeTo:         MaxLogLines,
	ReferenceLogLineId: NewestLogLineId,
}

// LogViewSelector selects a slice of logs.
// It works just like normal slicing, but indices are referenced relatively to certain reference line.
// So for example if reference line has index n and we want to download first 10 elements in array we have to use
// from -n to -n+10. Setting ReferenceLogLineId the first line will result in standard slicing.
type LogViewSelector struct {
	// ReferenceLogLineId is the ID of a line which should serve as a reference point for this selector.
	// You can set it to last or first line if needed. Setting to the first line will result in standard slicing.
	ReferenceLogLineId LogLineId
	// First index of the slice relatively to the reference line(this one will be included).
	RelativeFrom int
	// Last index of the slice relatively to the reference line (this one will not be included).
	RelativeTo int
}

// LogViewInfo provides information on the current log view.
// Fields have the same meaning as in LogViewSelector.
type LogViewInfo struct {
	ReferenceLogLineId LogLineId `json:"referenceLogLineId"`
	RelativeFrom       int       `json:"relativeFrom"`
	RelativeTo         int       `json:"relativeTo"`
}

// LogTimestamp is a timestamp that appears on the beginning of each log line.
type LogTimestamp string

const (
	NewestTimestamp = "newest"
	OldestTimestamp = "oldest"
)

// LogLineId uniquely identifies a line in logs - immune to log addition/deletion.
type LogLineId struct {
	// timestamp of this line.
	LogTimestamp `json:"logTimestamp"`
	// in case of timestamp duplicates (rather unlikely) it gives the index of the duplicate.
	// For example if this LogTimestamp appears 3 times in the logs and the line is 1nd line with this timestamp,
	// then line num will be 1 or -3 (1st from beginning or 3rd from the end).
	// If timestamp is unique then it will be simply 1 or -1 (first from the beginning or first from the end, both mean the same).
	LineNum int `json:"lineNum"`
}

// NewestLogLineId is the reference Id of the newest line.
var NewestLogLineId = LogLineId{
	LogTimestamp: NewestTimestamp,
}

// OldestLogLineId is the reference Id of the oldest line.
var OldestLogLineId = LogLineId{
	LogTimestamp: OldestTimestamp,
}

// LogLines is a list of strings that provides means of selecting log views.
// Problem with logs is that old logs are being deleted and new logs are constantly added.
// Therefore the number of logs constantly changes and we cannot use normal indexing. For example
// if certain line has index N then it may not have index N anymore 1 second later as logs at the beginning of the list
// are being deleted. Therefore it is necessary to reference log indices relative to some line that we are certain will not be deleted.
// For example line in the middle of logs should have lifetime sufficiently long for the purposes of log visualisation. On average its lifetime
// is equal to half of the log retention time. Therefore line in the middle of logs would serve as a good reference point.
// LogLines allows to get ID of any line - this ID later allows to uniquely identify this line. Also it allows to get any
// slice of logs relatively to certain reference line ID.
type LogLines []string

// isLineMatchingLogTimestamp checks whether line at index lineIndex matches provided log timestamp.
func (self LogLines) isLineMatchingLogTimestamp(lineIndex int, logTimestamp LogTimestamp) bool {
	return strings.HasPrefix(self[lineIndex], string(logTimestamp))
}

// GetLineIndex returns the index of the line (referenced from beginning of log array) with provided logLineId.
func (self LogLines) GetLineIndex(logLineId *LogLineId) int {
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
		if self.isLineMatchingLogTimestamp(idx, logTimestamp) {
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

// getLogLineTimestamp returns timestamp of the line with provided lineIndex.
func (self LogLines) getLogLineTimestamp(lineIndex int) LogTimestamp {
	return LogTimestamp(self[lineIndex][0:strings.Index(self[lineIndex], " ")])
}

// GetLogLineId returns ID of the line with provided lineIndex.
func (self LogLines) GetLogLineId(lineIndex int) *LogLineId {
	logTimestamp := self.getLogLineTimestamp(lineIndex)
	// determine whether to use negative or positive indexing
	// check whether last line has the same index as requested line. If so, we can only use positive referencing
	// as more lines may appear at the end.
	// negative referencing is preferred as higher indices disappear later.
	var step int
	if self.isLineMatchingLogTimestamp(len(self)-1, logTimestamp) {
		// use positive referencing
		step = 1
	} else {
		step = -1
	}
	offset := step
	for ; 0 <= lineIndex-offset && lineIndex-offset < len(self); offset += step {
		if !self.isLineMatchingLogTimestamp(lineIndex-offset, logTimestamp) {
			break
		}
	}
	return &LogLineId{
		LogTimestamp: logTimestamp,
		LineNum:      offset,
	}
}

// SelectLogs returns selected part of LogLines as required by logSelector, moreover it returns IDs of first and last
// of returned lines and the information of the resulting logView.
func (self LogLines) SelectLogs(logSelector *LogViewSelector) (LogLines, LogLineId, LogLineId, LogViewInfo) {
	requestedNumItems := logSelector.RelativeTo - logSelector.RelativeFrom
	referenceLineIndex := self.GetLineIndex(&logSelector.ReferenceLogLineId)
	if referenceLineIndex == LINE_INDEX_NOT_FOUND || requestedNumItems <= 0 || len(self) == 0 {
		// Requested reference line could not be found, probably it's already gone or requested no logs. Return no logs.
		return LogLines{}, LogLineId{}, LogLineId{}, LogViewInfo{}
	}
	fromIndex := referenceLineIndex + logSelector.RelativeFrom
	toIndex := referenceLineIndex + logSelector.RelativeTo
	if requestedNumItems > len(self) {
		fromIndex = 0
		toIndex = len(self)
	} else if toIndex > len(self) {
		fromIndex -= toIndex - len(self)
		toIndex = len(self)
	} else if fromIndex < 0 {
		toIndex += -fromIndex
		fromIndex = 0
	}
	// set the middle of log array as a reference point, this part of array should not be affected by log deletion/addition.
	logViewInfo := LogViewInfo{
		ReferenceLogLineId: *self.GetLogLineId(len(self) / 2),
		RelativeFrom:       fromIndex - len(self)/2,
		RelativeTo:         toIndex - len(self)/2,
	}
	return self[fromIndex:toIndex], *self.GetLogLineId(fromIndex), *self.GetLogLineId(toIndex - 1), logViewInfo
}

// ToLogLines converts rawLogs (string) to LogLines. This might be slow as we have to split ALL logs by \n.
// The solution could be to split only required part of logs. To find reference line - do smart binary search on raw string -
// select the middle, search slightly left and slightly right to find timestamp, eliminate half of the raw string,
// repeat until found required timestamp. Later easily find and split N subsequent/preceding lines.
func ToLogLines(rawLogs string) LogLines {
	logLines := LogLines{}
	for _, line := range strings.Split(rawLogs, "\n") {
		if line != "" {
			logLines = append(logLines, line)
		}
	}
	return logLines
}
