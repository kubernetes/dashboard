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
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {Ace, config, edit} from 'ace-builds';
import {ThemeService} from '../../services/global/theme';

enum EditorTheme {
  light = 'textmate',
  dark = 'idle_fingers',
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

  @ViewChild('editor') editorRef: ElementRef;

  editor: Ace.Editor;
  theme: string;
  // All possible options can be found at:
  // https://github.com/ajaxorg/ace/wiki/Configuring-Ace
  options = {
    showPrintMargin: false,
    highlightActiveLine: true,
    tabSize: 2,
    wrap: true,
    fontSize: 14,
    fontFamily: "'Roboto Mono Regular', monospace",
  };

  constructor(private readonly themeService_: ThemeService) {}

  ngOnInit(): void {
    this.theme = this.themeService_.isThemeDark() ? EditorTheme.dark : EditorTheme.light;
  }

  ngAfterViewInit(): void {
    this.initEditor_();
  }

  onTextChange(text: string): void {
    this.textChange.emit(text);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.editor) {
      return;
    }

    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'text':
            this.onExternalUpdate_();
            break;
          case 'mode':
            this.onEditorModeChange_();
            break;
          default:
        }
      }
    }
  }

  private initEditor_(): void {
    config.set('basePath', 'ace');

    this.editor = edit(this.editorRef.nativeElement);
    this.prettify_();

    this.editor.setOptions(this.options);
    this.editor.setValue(this.text, -1);
    this.editor.setReadOnly(this.readOnly);
    this.setEditorTheme_();
    this.setEditorMode_();
    this.editor.session.setUseWorker(false);
    this.editor.on('change', () => this.onEditorTextChange_());
  }

  private onExternalUpdate_(): void {
    this.prettify_();
    const point = this.editor.getCursorPosition();
    this.editor.setValue(this.text, -1);
    this.editor.moveCursorToPosition(point);
  }

  private onEditorTextChange_(): void {
    this.text = this.editor.getValue();
    this.onTextChange(this.text);
  }

  private onEditorModeChange_(): void {
    this.setEditorMode_();
  }

  private setEditorTheme_(): void {
    this.editor.setTheme(`ace/theme/${this.theme}`);
  }

  private setEditorMode_(): void {
    this.editor.session.setMode(`ace/mode/${this.mode}`);
  }

  private prettify_(): void {
    if (!this.prettify) {
      return;
    }

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
