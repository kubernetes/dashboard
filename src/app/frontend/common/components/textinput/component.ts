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

import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'kd-text-input',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class TextInputComponent implements OnInit {
  @Input() text = '';
  @Input() readOnly = false;
  @Input() useJsonFormat = false;

  // All possible options can be found at:
  // https://github.com/ajaxorg/ace/wiki/Configuring-Ace
  options = {
    highlightActiveLine: false,
    tabSize: 2,
    wrap: true,
  };

  ngOnInit(): void {
    if (this.useJsonFormat) {
      this.formatAsJson_();
    }

    // TODO Adjust theme on theme change. Unsubscribe on destroy.
    // this.theme_.subscribe((isLightThemeEnabled) => {
    //   this.theme = isLightThemeEnabled ? Themes.light : Themes.dark;
    // });
  }

  /**
   * Ensure pretty print even no matter if string or object was is the input.
   */
  private formatAsJson_(): void {
    if (typeof this.text === 'string') {
      this.text = JSON.stringify(JSON.parse(this.text), null, '\t');
    } else {
      this.text = JSON.stringify(this.text, null, '\t');
    }
  }
}
