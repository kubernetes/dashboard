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

import {Component, Input, OnChanges, SimpleChanges, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatButtonToggleGroup} from '@angular/material/button-toggle';
import {dump as toYaml, load as fromYaml} from 'js-yaml';
import {EditorMode} from '../../components/textinput/component';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'kd-editor-group',
  templateUrl: 'template.html',
})
export class EditorGroup implements OnInit, OnChanges, OnDestroy {
  selectedMode = EditorMode.YAML;
  text = '';
  readonly modes = EditorMode;
  private unsubscribe_ = new Subject<void>();
  @Input() initialText: string;
  @Input() readOnly: boolean;
  @ViewChild('group', {static: true}) buttonToggleGroup: MatButtonToggleGroup;

  ngOnInit(): void {
    this.text = this.initialText;
    this.buttonToggleGroup.valueChange.pipe(takeUntil(this.unsubscribe_)).subscribe((selectedMode: EditorMode) => {
      this.selectedMode = selectedMode;

      if (this.text) {
        this.updateText();
      }
    });
  }

  getJSON(): string {
    if (this.selectedMode === EditorMode.YAML) {
      return this.toRawJSON(fromYaml(this.text));
    }
    return this.text;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.initialText) {
      this.text = changes.initialText.currentValue;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
  }

  getSelectedMode(): EditorMode {
    return this.buttonToggleGroup.value;
  }

  private updateText(): void {
    if (this.selectedMode === EditorMode.YAML) {
      this.text = toYaml(JSON.parse(this.text));
    } else {
      this.text = this.toRawJSON(fromYaml(this.text));
    }
  }

  private toRawJSON(object: {}): string {
    return JSON.stringify(object, null, '\t');
  }
}
