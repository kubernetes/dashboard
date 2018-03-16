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

import {Component, Input, OnInit} from '@angular/core';

import {ThemeService} from '../../services/global/theme';

enum EditorTheme {
  light = 'textmate',
  dark = 'idle_fingers',
}

enum EditorMode {
  json = 'json',
  yaml = 'yaml',
}

@Component({
  selector: 'kd-text-input',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class TextInputComponent implements OnInit {
  @Input() text = '';
  @Input() readOnly = false;
  @Input() useJsonFormat = false;
  @Input() border = true;

  // Default editor settings
  mode = EditorMode.yaml;
  theme: string;
  // All possible options can be found at:
  // https://github.com/ajaxorg/ace/wiki/Configuring-Ace
  options = {
    highlightActiveLine: false,
    tabSize: 2,
    wrap: true,
    fontSize: 14,
    fontFamily: `'Roboto Mono Regular', monospace`,
  };

  constructor(private readonly themeService_: ThemeService) {}

  ngOnInit(): void {
    this.mode = this.useJsonFormat ? EditorMode.json : EditorMode.yaml;
    if (this.useJsonFormat) {
      this.formatAsJson_();
    }

    this.theme = this.themeService_.isLightThemeEnabled() ? EditorTheme.light : EditorTheme.dark;
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
