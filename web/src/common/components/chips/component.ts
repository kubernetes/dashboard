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
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {StringMap} from '@api/root.shared';
// @ts-ignore
import truncateUrl from 'truncate-url';

import {GlobalSettingsService} from '../../services/global/globalsettings';
import {ChipDialog} from './chipdialog/dialog';
import {KdStateService} from '@common/services/global/state';

export interface Chip {
  key: string;
  value: string;
}

/**
 * Regular expression for URL validation created by @dperini.
 * https://gist.github.com/dperini/729294
 */
const URL_REGEXP = new RegExp(
  '^(?:(?:https?|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!' +
    '(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1' +
    ',3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])' +
    '){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*' +
    '[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]' +
    '+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))\\.?)(?::\\d{2,5})?(?:[/?#]\\S*)?$',
  'i'
);

const MAX_CHIP_VALUE_LENGTH = 63;

@Component({
  selector: 'kd-chips',
  styleUrls: ['./style.scss'],
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsComponent implements OnInit, OnChanges {
  @Input() map: StringMap | string[] | number[];
  @Input() displayAll = false;
  keys: string[];
  isShowingAll = false;
  private _labelsLimit = 3;

  constructor(
    private readonly _kdStateService: KdStateService,
    private readonly _globalSettingsService: GlobalSettingsService,
    private readonly _matDialog: MatDialog,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._labelsLimit = this._globalSettingsService.getLabelsLimit();
    this.processMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.map) {
      this.processMap();
    }
  }

  isVisible(index: number): boolean {
    return this.isShowingAll || index < this._labelsLimit || this.displayAll;
  }

  isAnythingHidden(): boolean {
    return this.keys.length > this._labelsLimit && !this.displayAll;
  }

  toggleView(): void {
    this.isShowingAll = !this.isShowingAll;
  }

  isTooLong(value: string): boolean {
    return value !== undefined && value.length > MAX_CHIP_VALUE_LENGTH;
  }

  getTruncatedURL(url: string): string {
    return truncateUrl(url, MAX_CHIP_VALUE_LENGTH);
  }

  isHref(value: string): boolean {
    return URL_REGEXP.test(value.trim());
  }

  isSerializedRef(value: string): boolean {
    try {
      const obj = JSON.parse(value);
      return obj && obj.kind === 'SerializedReference';
    } catch (e) {
      return false;
    }
  }

  getSerializedHref(value: string): string {
    const ref = JSON.parse(value);
    if (!ref.reference || !ref.reference.kind || !ref.reference.name || !ref.reference.namespace) {
      return '';
    }

    return this._kdStateService.href(ref.reference.kind.toLowerCase(), ref.reference.name, ref.reference.namespace);
  }

  getSerializedRefDisplayName(value: string): string {
    const ref = JSON.parse(value);
    if (!ref.reference || !ref.reference.kind || !ref.reference.name || !ref.reference.namespace) {
      return 'Invalid reference';
    }

    return `${ref.reference.kind.replace(/([A-Z])/g, ' $1')} ${ref.reference.namespace}/${ref.reference.name}`;
  }

  openChipDialog(key: string, value: string): void {
    const dialogConfig: MatDialogConfig<Chip> = {
      width: '630px',
      data: {
        key,
        value,
      },
    };
    this._matDialog.open(ChipDialog, dialogConfig);
  }

  private processMap() {
    if (!this.map) {
      this.map = [];
    }

    if (Array.isArray(this.map)) {
      this.keys = this.map as string[];
    } else {
      this.keys = Object.keys(this.map);
    }
    this._changeDetectorRef.markForCheck();
  }
}
