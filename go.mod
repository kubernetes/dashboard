module github.com/kubernetes/dashboard

go 1.12

require (
	github.com/docker/distribution v2.7.0+incompatible
	github.com/docker/spdystream v0.0.0-20181023171402-6480d4af844c // indirect
	github.com/elazarl/goproxy v0.0.0-20190421051319-9d40249d3c2f // indirect
	github.com/elazarl/goproxy/ext v0.0.0-20190421051319-9d40249d3c2f // indirect
	github.com/emicklei/go-restful v2.9.6+incompatible
	github.com/evanphx/json-patch v4.2.0+incompatible // indirect
	github.com/gogo/protobuf v1.2.0 // indirect
	github.com/golang/glog v0.0.0-20160126235308-23def4e6c14b
	github.com/google/gofuzz v1.0.0 // indirect
	github.com/googleapis/gnostic v0.2.0 // indirect
	github.com/gorilla/websocket v1.4.0 // indirect
	github.com/igm/sockjs-go v2.0.1+incompatible // indirect
	github.com/imdario/mergo v0.3.6 // indirect
	github.com/json-iterator/go v1.1.6 // indirect
	github.com/kr/pretty v0.1.0 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.1 // indirect
	github.com/onsi/ginkgo v1.8.0 // indirect
	github.com/onsi/gomega v1.5.0 // indirect
	github.com/opencontainers/go-digest v1.0.0-rc1 // indirect
	github.com/prometheus/client_golang v0.9.2
	github.com/prometheus/common v0.0.0-20181218105931-67670fe90761 // indirect
	github.com/prometheus/procfs v0.0.0-20190102135031-14fa7590c24d // indirect
	github.com/spf13/pflag v1.0.3
	golang.org/x/crypto v0.0.0-20190611184440-5c40567a22f8 // indirect
	golang.org/x/net v0.0.0-20190613194153-d28f0bde5980
	golang.org/x/oauth2 v0.0.0-20190604053449-0f29369cfe45 // indirect
	golang.org/x/sync v0.0.0-20190423024810-112230192c58 // indirect
	golang.org/x/sys v0.0.0-20190616124812-15dcb6c0061f // indirect
	golang.org/x/text v0.3.2
	golang.org/x/time v0.0.0-20181108054448-85acf8d2951c // indirect
	google.golang.org/appengine v1.5.0 // indirect
	gopkg.in/check.v1 v1.0.0-20180628173108-788fd7840127 // indirect
	gopkg.in/igm/sockjs-go.v2 v2.0.0
	gopkg.in/inf.v0 v0.9.1 // indirect
	gopkg.in/square/go-jose.v2 v2.2.2
	gopkg.in/yaml.v2 v2.2.2
	k8s.io/api v0.0.0-20190627205229-acea843d18eb
	k8s.io/apiextensions-apiserver v0.0.0-20190315093550-53c4693659ed
	k8s.io/apimachinery v0.0.0-20190627205106-bc5732d141a8
	k8s.io/client-go v11.0.0+incompatible
	k8s.io/heapster v1.5.4
	k8s.io/klog v0.3.1 // indirect
	k8s.io/kube-openapi v0.0.0-20190228160746-b3a7cee44a30 // indirect
	k8s.io/utils v0.0.0-20190607212802-c55fbcfc754a // indirect
	sigs.k8s.io/yaml v1.1.0 // indirect
)

replace k8s.io/apimachinery => k8s.io/apimachinery v0.0.0-20190313205120-d7deff9243b1
