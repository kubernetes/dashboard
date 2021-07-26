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
	name          string `json:"name"`
	elementType   string `json:"elementType"`
	permissions   string `json:"permissions"`
	numberOfLinks uint   `json:"numberOfLinks"`
	owner         string `json:"owner"`
	group         string `json:"group"`
	size          uint   `json:"size"`
	lastModified  string `json:"lastModified"`
}

type FilesystemObject struct {
	path      string              `json:"path"`
	totalSize uint                `json:"totalSize"`
	elements  []FilesystemElement `json:"elements"`
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

	path = "/"
	cmd := []string{"ls", "-la", "--full-time", "--color=never", path}
	fmt.Println("AAAAAAAAAAAAAAAAAAAAAAA")
	err := startProcessHelper(k8sClient, cfg, request, cmd, streamOptions)

	if err != nil {
		return nil, err
	}
	fmt.Println("BBBBBBBBBBBBBBBBBBBBBBB")
	the_stdout := my_stdout.String()
	fmt.Println(the_stdout)
	fmt.Println("CCCCCCCCCCCCCCCCC")
	fmt.Println(my_stderr.String())
	fmt.Println("DDDDDDDDDDDDDD")
	output, err := parseLsOutput(path, the_stdout)
	fmt.Println("EEEEEEEEEEEEE")

	if err != nil {
		return nil, err
	}

	fmt.Printf("%+v\n", output)

	return &FilesystemObject{
		path:      "some_path",
		totalSize: 42,
		elements:  nil,
	}, nil

	// return &output, err
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
		path:      path,
		elements:  []FilesystemElement{},
		totalSize: 0,
	}

	scanner := bufio.NewScanner(strings.NewReader(lsOutput))
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "total ") {
			fmt.Sscanf(line, "total %d", &output.totalSize)
			continue
		}

		parsedLine := parseLsLine(line)
		output.elements = append(output.elements, parsedLine)
	}
	return output, nil
}

func parseLsLine(line string) FilesystemElement {
	elem := FilesystemElement{}
	elem.elementType = string(line[0])

	date := ""
	time := ""
	timezone := ""

	// drwxrwxr-x  2 mdiez mdiez  4096 2021-02-25 12:34:27.605691421 -0300 args
	fmt.Sscanf(line, "%s %d %s %s %d %s %s %s %s",
		&elem.permissions,
		&elem.numberOfLinks,
		&elem.owner,
		&elem.group,
		&elem.size,
		&date,
		&time,
		&timezone,
		&elem.name,
	)

	elem.lastModified = fmt.Sprintf("%s %s %s", date, time, timezone)

	fmt.Printf("%+v\n", elem)
	return elem
}
