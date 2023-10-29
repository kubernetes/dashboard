# -*- mode: Python -*-

envsubst_cmd = "envsubst"
kubectl_cmd = "kubectl"

# Load extensions
load("ext://restart_process", "docker_build_with_restart")
load("ext://cert_manager", "deploy_cert_manager")
load('ext://helm_remote', 'helm_remote')

def kubernetes_dashboard():
  local_resource(
    'build-api',
    cmd = 'cd modules/api;make build',
    deps = ['modules/api/main.go', 'modules/api/pkg']
  )

  local_resource(
    'build-web',
    cmd = 'cd modules/web;make build',
    deps = ['modules/web/main.go', 'modules/web/pkg', 'modules/web/src', 'modules/web/i18n']
  )

  docker_build(
    'dashboard-api',
    context = '.',
    entrypoint = ["/dashboard-api", "--insecure-bind-address=0.0.0.0", "--bind-address=0.0.0.0"],
    dockerfile = './modules/api/Dockerfile',
    only = ['./.dist/api'],
    live_update = [
      sync('.dist/api/linux/amd64/dashboard-api', '/dashboard-api')
    ]
  )

  docker_build(
    'dashboard-web',
    context = '.',
    entrypoint = ["/dashboard-web", "--insecure-bind-address=0.0.0.0", "--bind-address=0.0.0.0"],
    dockerfile = './modules/web/Dockerfile',
    only = ['./.dist/web'],
    live_update = [
      sync('.dist/web/linux/amd64/dashboard-api', '/dashboard-web')
    ],
    ignore = ['./modules/web/angular']
  )

##############################
# Actual work happens here
##############################

# Deploy Ingress Nginx
helm_remote('ingress-nginx',
            version="4.6.1",
            repo_name='ingress-nginx',
            namespace='ingress-nginx',
            create_namespace='true',
            set=['controller.admissionWebhooks.enabled=false'],
            repo_url='https://kubernetes.github.io/ingress-nginx')

# Deploy Metrics Server
helm_remote('metrics-server',
            version="3.10.0",
            repo_name='metrics-server',
            namespace='metrics-server',
            create_namespace='true',
            set=["args={--kubelet-preferred-address-types=InternalIP,--kubelet-insecure-tls=true}"],
            repo_url='https://kubernetes-sigs.github.io/metrics-server/')

deploy_cert_manager()


kubernetes_dashboard()

k8s_yaml('./charts/kubernetes-dashboard.yaml')
