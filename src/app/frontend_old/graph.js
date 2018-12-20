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

/**
 * @fileoverview Externs for search module.
 *
 * @externs
 */

const kdGraph = {};

/**
 * Settings object that should be provided for every metric supported by graph frontend.
 *
 * @typedef {{
 *   yAxisType: !backendApi.ObjectMeta,
 *   area: boolean,
 *   key: string,
 *   color: string,
 *   fillOpacity: number,
 *   strokeWidth: number,
 *   type: string,
 *   yAxis: number,
 * }}
 */
kdGraph.metricSetting;

/**
 * Settings object that should be provided for every axis type supported by graph frontend.
 *
 * @typedef {{
 *   formatter: function(number):string,
 *   label: string,
 * }}
 */
kdGraph.axisSetting;
