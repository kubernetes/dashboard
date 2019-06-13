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

import {format} from 'd3';

/** Base for prefixes */
const coreBase = 1000;

/** Names of the suffixes where I-th name is for base^I suffix. */
const corePowerSuffixes = ['', 'k', 'M', 'G', 'T'];

function precisionFilter(d: number): string {
  if (d >= 1000) {
    return format(',')(Number(d.toPrecision(3)));
  }
  if (d < 0.01) {
    return d.toPrecision(1);
  } else if (d < 0.1) {
    return d.toPrecision(2);
  }
  return d.toPrecision(3);
}

/**
 * Returns filter function that formats cores usage.
 */
export function coresFilter(value: number): string {
  // Convert millicores to cores.
  value = value / 1000;

  let divider = 1;
  let power = 0;

  while (value / divider > coreBase && power < corePowerSuffixes.length - 1) {
    divider *= coreBase;
    power += 1;
  }
  const formatted = precisionFilter(value / divider);
  const suffix = corePowerSuffixes[power];
  return suffix ? `${formatted} ${suffix}` : formatted;
}

/** Base for binary prefixes */
const memoryBase = 1024;

/** Names of the suffixes where I-th name is for base^I suffix. */
const memoryPowerSuffixes = ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi'];

/**
 * Returns filter function that formats memory in bytes.
 */
export function memoryFilter(value: number): string {
  let divider = 1;
  let power = 0;

  while (value / divider > memoryBase && power < memoryPowerSuffixes.length - 1) {
    divider *= memoryBase;
    power += 1;
  }
  const formatted = precisionFilter(value / divider);
  const suffix = memoryPowerSuffixes[power];
  return suffix ? `${formatted} ${suffix}` : formatted;
}
