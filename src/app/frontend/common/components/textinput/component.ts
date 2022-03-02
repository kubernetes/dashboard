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

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {ThemeService} from '../../services/global/theme';

enum EditorTheme {
  light = 'vs',
  dark = 'vs-dark',
}

export enum EditorMode {
  JSON = 'json',
  YAML = 'yaml',
}

@Component({
  selector: 'kd-text-input',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class TextInputComponent implements OnInit, AfterViewInit, OnChanges {
  @Output() textChange = new EventEmitter<string>();
  @Input() text: string;
  @Input() readOnly = false;
  @Input() mode = EditorMode.YAML;
  @Input() prettify = true;
  @Input() border = true;

  options: any = {
    contextmenu: false,
    fontFamily: 'Roboto Mono Regular, monospace',
    fontSize: 14,
    lineNumbersMinChars: 4,
    minimap: {enabled: false},
    scrollbar: {vertical: 'hidden'},
    hideCursorInOverviewRuler: true,
    renderLineHighlight: 'line',
    wordWrap: 'on',
  };

  constructor(private readonly themeService_: ThemeService) {}

  ngOnInit(): void {
    this.options.theme = this.themeService_.isThemeDark() ? EditorTheme.dark : EditorTheme.light;
    this.options.language = this.mode;
    this.options.readOnly = this.readOnly;

    // TODO: Move above.
  }

  ngAfterViewInit(): void {
    this._prettify();
  }

  ngOnChanges(_: SimpleChanges): void {
    this._prettify();
  }

  onChange(): void {
    this.textChange.emit(this.text);
  }

  private _prettify(): void {
    if (this.prettify) {
      try {
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
      } catch (e) {
        // Ignore any errors in case of wrong format. Formatting will not be applied.
      }
    }
  }
}
