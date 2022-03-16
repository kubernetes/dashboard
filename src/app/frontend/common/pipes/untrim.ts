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

import {Pipe} from '@angular/core';
import {SafeHtml} from '@angular/platform-browser';

/**
 * Replaces all whitespace characters with the non-breaking unicode space to keep i.e. indent
 */
@Pipe({name: 'kdUntrim'})
export class UntrimPipe {
  private readonly _nonBreakingSpace = 160;

  transform(value: string | SafeHtml): string {
    return value?.toString().replace(/\s/g, String.fromCharCode(this._nonBreakingSpace));
  }
}
