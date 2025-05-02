# Copyright 2017 The Kubernetes Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "kubernetes-dashboard.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "kubernetes-dashboard.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "kubernetes-dashboard.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "kubernetes-dashboard.labels" -}}
helm.sh/chart: {{ include "kubernetes-dashboard.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: {{ include "kubernetes-dashboard.name" . }}
{{- with .Values.app.labels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{/*
Common label selectors
*/}}
{{- define "kubernetes-dashboard.matchLabels" -}}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: {{ include "kubernetes-dashboard.name" . }}
{{- end -}}

{{/*
Common annotations
*/}}
{{- define "kubernetes-dashboard.annotations" -}}
{{- with .Values.app.annotations }}
{{- toYaml . }}
{{- end }}
{{- end -}}

{{- define "kubernetes-dashboard.app.csrf.secret.name" -}}
{{- printf "%s-%s" ( include "kubernetes-dashboard.fullname" . ) "csrf"}}
{{- end -}}

{{- define "kubernetes-dashboard.app.ingress.secret.name" -}}
{{- printf "%s-%s" ( include "kubernetes-dashboard.fullname" . ) "certs"}}
{{- end -}}

{{- define "kubernetes-dashboard.app.csrf.secret.key" -}}
{{- printf "private.key" }}
{{- end -}}

{{- define "kubernetes-dashboard.app.csrf.secret.value" -}}
{{- $secretName := (include "kubernetes-dashboard.app.csrf.secret.name" .) -}}
{{- $secret := lookup "v1" "Secret" .Release.Namespace $secretName -}}
{{- if .Values.app.security.csrfKey -}}
private.key: {{ .Values.app.security.csrfKey | b64enc | quote }}
{{- else if and $secret (hasKey $secret "data") (hasKey $secret.data "private.key") (index $secret.data "private.key") -}}
private.key: {{ index $secret.data "private.key" }}
{{- else -}}
private.key: {{ randBytes 256 | b64enc | quote }}
{{- end -}}
{{- end -}}

{{- define "kubernetes-dashboard.metrics-scraper.name" -}}
{{- printf "%s-%s" ( include "kubernetes-dashboard.fullname" . ) ( .Values.metricsScraper.role )}}
{{- end -}}

{{- define "kubernetes-dashboard.web.configMap.settings.name" -}}
{{- printf "%s-%s-%s" ( include "kubernetes-dashboard.fullname" . ) ( .Values.web.role ) "settings" }}
{{- end -}}

{{- define "kubernetes-dashboard.validate.mode" -}}
{{- if not (or (eq .Values.app.mode "dashboard") (eq .Values.app.mode "api")) -}}
{{- fail "value of .Values.app.mode must be one of [dashboard, api]"}}
{{- end -}}
{{- end -}}

{{- define "kubernetes-dashboard.validate.ingressIssuerScope" -}}
{{- if not (or (eq .Values.app.ingress.issuer.scope "disabled") (eq .Values.app.ingress.issuer.scope "default") (eq .Values.app.ingress.issuer.scope "cluster")) }}
{{- fail "value of .Values.app.ingress.issuer.scope must be one of [default, cluster, disabled]"}}
{{- end -}}
{{- end -}}
