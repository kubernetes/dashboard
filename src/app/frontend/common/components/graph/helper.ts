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

export class FormattedValue {
  private readonly base_: number;
  private readonly suffixes_: string[];

  private value_: number;
  private suffix_: string;

  get suffix(): string {
    return this.suffix_;
  }

  get value(): number {
    return this.value_;
  }

  get suffixPower(): number {
    return this.suffixes_.indexOf(this.suffix_);
  }

  private constructor(base: number, value: number, suffixes: string[]) {
    this.suffixes_ = suffixes;
    this.base_ = base;
    this.value_ = this.normalize_(value);
  }

  private normalize_(value: number): number {
    let divider = 1;
    let power = 0;

    while (value / divider > this.base_ && power < this.suffixes_.length - 1) {
      divider *= this.base_;
      power += 1;
    }

    this.suffix_ = this.suffixes_[power];
    return Number((value / divider).toPrecision(3));
  }

  normalize(suffix: string): void {
    const currentPower = this.suffixes_.indexOf(this.suffix_);
    const expectedPower = this.suffixes_.indexOf(suffix);

    if (expectedPower < 0) {
      throw new Error(`Suffix '${suffix}' not recognized.`);
    }

    let powerDiff = expectedPower - currentPower;

    if (powerDiff < 0) {
      powerDiff = -powerDiff;
      this.value_ = this.value_ * Math.pow(this.base_, powerDiff);
      this.suffix_ = suffix;
    }

    if (powerDiff > 0) {
      this.value_ = this.value_ / Math.pow(this.base_, powerDiff);
      this.suffix_ = suffix;
    }

    this.value_ = Number(this.value_.toPrecision(3));
  }

  static NewFormattedCoreValue(value: number): FormattedValue {
    /** Base for prefixes */
    const coreBase = 1000;

    /** Names of the suffixes where I-th name is for base^I suffix. */
    const corePowerSuffixes = ['', 'k', 'M', 'G', 'T'];

    return new FormattedValue(coreBase, value / 1000, corePowerSuffixes);
  }

  static NewFormattedMemoryValue(value: number): FormattedValue {
    /** Base for binary prefixes */
    const memoryBase = 1024;

    /** Names of the suffixes where I-th name is for base^I suffix. */
    const memoryPowerSuffixes = ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi'];

    return new FormattedValue(memoryBase, value, memoryPowerSuffixes);
  }
}
