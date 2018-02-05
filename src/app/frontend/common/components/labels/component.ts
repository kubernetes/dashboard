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

import {Component, Input} from '@angular/core';
import {StringMap} from '@api/backendapi';

@Component({
  selector: 'kd-labels',
  templateUrl: './template.html',
})
export class LabelsComponent {
  @Input() labels: StringMap;

  constructor() {}
}

// const alwaysVisibleLabelsNumber = 5;
//
// /**
//  * Regular expression for URL validation created by @dperini.
//  * https://gist.github.com/dperini/729294
//  *
//  * @type {RegExp}
//  */
// const urlRegexp = new RegExp(
//     '^(?:(?:https?|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)'
//     +
//         '(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|'
//         +
//         '22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?'
//         +
//         ':(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u'
//         +
//         '00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))\\.?)(?::\\d{2,5})?(?:[/?#]\\S*)?$',
//     'i');
//
//     this.isShowingAllLabels_ = false;
//   }
//
//   isVisible(index) {
//     return this.isShowingAllLabels_ || index < alwaysVisibleLabelsNumber;
//   }
//
//   isMoreAvailable() {
//     return Object.keys(this.labels).length > alwaysVisibleLabelsNumber;
//   }
//
//   isShowingAll() {
//     return this.isShowingAllLabels_;
//   }
//
//   switchLabelsView() {
//     this.isShowingAllLabels_ = !this.isShowingAllLabels_;
//   }
//
//   isHref(value) {
//     return urlRegexp.test(value.trim());
//   }
// }
