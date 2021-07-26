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

package handler

import (
	"bufio"
	"bytes"
	"fmt"
	restful "github.com/emicklei/go-restful/v3"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/remotecommand"
	"strings"
)

type FilesystemElement struct {
	Name          string `json:"name"`
	ElementType   string `json:"elementType"`
	Permissions   string `json:"permissions"`
	NumberOfLinks uint   `json:"numberOfLinks"`
	Owner         string `json:"owner"`
	Group         string `json:"group"`
	Size          uint   `json:"size"`
	LastModified  string `json:"lastModified"`
}

type FilesystemObject struct {
	Path      string              `json:"path"`
	TotalSize uint                `json:"totalSize"`
	Elements  []FilesystemElement `json:"elements"`
}

func runLsCommand(k8sClient kubernetes.Interface, cfg *rest.Config, request *restful.Request, path string) (*FilesystemObject, error) {

	my_stdout := bytes.NewBufferString("")
	my_stderr := bytes.NewBufferString("")
	streamOptions := remotecommand.StreamOptions{
		Stdin:  nil,
		Stdout: my_stdout,
		Stderr: my_stderr,
		Tty:    true,
	}

	if path == "" {
		path = "/"
	}

	cmd := []string{"ls", "-la", "--full-time", "--color=never", path}
	err := startProcessHelper(k8sClient, cfg, request, cmd, streamOptions)

	if err != nil {
		return nil, err
	}
	the_stdout := my_stdout.String()
	output, err := parseLsOutput(path, the_stdout)

	if err != nil {
		return nil, err
	}
	return &output, err
}

// total 84
// drwxrwxr-x 17 mdiez mdiez  4096 2021-05-24 12:42:55.902395373 -0300 .
// drwxrwxr-x  4 mdiez mdiez  4096 2020-12-15 20:15:54.164381402 -0300 ..
// drwxrwxr-x  2 mdiez mdiez  4096 2021-07-25 19:01:41.509627375 -0300 api
// drwxrwxr-x  2 mdiez mdiez  4096 2021-02-25 12:34:27.605691421 -0300 args
// drwxrwxr-x  4 mdiez mdiez  4096 2021-06-02 09:32:27.882452757 -0300 auth
// drwxrwxr-x  4 mdiez mdiez  4096 2021-02-25 12:34:27.605691421 -0300 cert

func parseLsOutput(path string, lsOutput string) (FilesystemObject, error) {
	output := FilesystemObject{
		Path:      path,
		Elements:  []FilesystemElement{},
		TotalSize: 0,
	}

	scanner := bufio.NewScanner(strings.NewReader(lsOutput))
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "total ") {
			fmt.Sscanf(line, "total %d", &output.TotalSize)
			continue
		}

		parsedLine := parseLsLine(line)
		output.Elements = append(output.Elements, parsedLine)
	}
	return output, nil
}

func parseLsLine(line string) FilesystemElement {
	elem := FilesystemElement{}

	date := ""
	time := ""
	timezone := ""
	permissions := ""

	// drwxrwxr-x  2 mdiez mdiez  4096 2021-02-25 12:34:27.605691421 -0300 args
	fmt.Sscanf(line, "%s %d %s %s %d %s %s %s %s",
		&permissions,
		&elem.NumberOfLinks,
		&elem.Owner,
		&elem.Group,
		&elem.Size,
		&date,
		&time,
		&timezone,
		&elem.Name,
	)

	elem.ElementType = string(permissions[0])
	elem.Permissions = permissions[1:len(permissions)]
	elem.LastModified = fmt.Sprintf("%s %s %s", date, time, timezone)

	return elem
}
