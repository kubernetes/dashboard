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

import {HttpClient} from '@angular/common/http';
import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {dump as toYaml, load as fromYaml} from 'js-yaml';
import {EditorMode} from '../../components/textinput/component';

import {RawResource} from '../../resources/rawresource';
import {ResourceMeta} from '../../services/global/actionbar';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'kd-delete-resource-dialog',
  templateUrl: 'template.html',
})
export class EditResourceDialog implements OnInit, OnDestroy {
  selectedMode = EditorMode.YAML;
  private unsubscribe_ = new Subject<void>();

  @ViewChild('group', {static: true}) buttonToggleGroup: MatButtonToggleGroup;
  text = '';
  modes = EditorMode;

  constructor(
    public dialogRef: MatDialogRef<EditResourceDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ResourceMeta,
    private readonly http_: HttpClient
  ) {}

  ngOnInit(): void {
    const url = RawResource.getUrl(this.data.typeMeta, this.data.objectMeta);
    this.http_
      .get(url)
      .toPromise()
      .then(response => {
        this.text = toYaml(response);
      });

    this.buttonToggleGroup.valueChange.pipe(takeUntil(this.unsubscribe_)).subscribe((selectedMode: EditorMode) => {
      this.selectedMode = selectedMode;

      if (this.text) {
        this.updateText();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getJSON(): string {
    if (this.selectedMode === EditorMode.YAML) {
      return this.toRawJSON(fromYaml(this.text));
    }

    return this.text;
  }

  getSelectedMode(): string {
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
