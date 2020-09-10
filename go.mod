module github.com/kubernetes/dashboard

go 1.15

replace k8s.io/apiextensions-apiserver => k8s.io/apiextensions-apiserver v0.19.0

require (
	github.com/docker/distribution v2.7.1+incompatible
	github.com/emicklei/go-restful v2.12.0+incompatible
	github.com/go-openapi/validate v0.19.5 // indirect
	github.com/golang/glog v0.0.0-20160126235308-23def4e6c14b
	github.com/opencontainers/go-digest v1.0.0 // indirect
	github.com/prometheus/client_golang v1.7.1
	github.com/spf13/cobra v1.0.0 // indirect
	github.com/spf13/pflag v1.0.5
	golang.org/x/mod v0.3.0 // indirect
	golang.org/x/net v0.0.0-20200707034311-ab3426394381
	golang.org/x/text v0.3.3
	golang.org/x/tools v0.0.0-20200616133436-c1934b75d054 // indirect
	gopkg.in/igm/sockjs-go.v2 v2.1.0
	gopkg.in/square/go-jose.v2 v2.4.1
	gopkg.in/yaml.v2 v2.3.0
	k8s.io/api v0.19.0
	k8s.io/apiextensions-apiserver v0.0.0-00010101000000-000000000000
	k8s.io/apimachinery v0.19.0
	k8s.io/apiserver v0.19.0 // indirect
	k8s.io/client-go v0.19.0
	k8s.io/gengo v0.0.0-20200428234225-8167cfdcfc14 // indirect
	k8s.io/heapster v1.5.4
	k8s.io/klog v1.0.0 // indirect
	sigs.k8s.io/structured-merge-diff/v3 v3.0.0-20200116222232-67a7b8c61874 // indirect
)
