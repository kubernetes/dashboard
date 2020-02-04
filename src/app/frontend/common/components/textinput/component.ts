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

// Ace-editor related imports
import 'brace';
import 'brace/mode/json';
import 'brace/mode/yaml';
import 'brace/theme/idle_fingers';
import 'brace/theme/textmate';
import 'brace/worker/json';

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {ThemeService} from '../../services/global/theme';
import {StringMap} from '@api/backendapi';

enum EditorTheme {
  light = 'textmate',
  dark = 'idle_fingers',
}

@Component({
  selector: 'kd-text-input',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class TextInputComponent implements OnInit {
  @Output() textChange = new EventEmitter<string>();
  @Input() text: string;
  @Input() readOnly = false;
  @Input() mode = 'yaml';
  @Input() prettify = true;
  @Input() border = true;
  theme: string;

  // All possible options can be found at:
  // https://github.com/ajaxorg/ace/wiki/Configuring-Ace
  options = {
    showPrintMargin: false,
    highlightActiveLine: true,
    tabSize: 2,
    wrap: true,
    fontSize: 14,
    fontFamily: `'Roboto Mono Regular', monospace`,
  };

  constructor(private readonly themeService_: ThemeService) {}

  ngOnInit(): void {
    this.theme = this.themeService_.isLightThemeEnabled() ? EditorTheme.light : EditorTheme.dark;
    if (this.prettify) {
      this.prettify_();
    }
  }

  onTextChange(text: string): void {
    this.textChange.emit(text);
  }

  private prettify_(): void {
    switch (this.mode) {
      case 'json':
        this.text = JSON.stringify(JSON.parse(this.text), null, '\t');
        // Replace \n with new lines
        this.text = this.text.replace(new RegExp(/\\n/g), '\n\t\t');
        break;
      default:
        // Do nothing when mode is not recognized.
        break;
    }
    this.onTextChange(this.text);
  }
}
