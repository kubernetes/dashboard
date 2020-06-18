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
import {StringMap} from '@api/backendapi';

import {ChipDialog} from './chipdialog/dialog';

// @ts-ignore
import * as truncateUrl from 'truncate-url';

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
  'i',
);

const MAX_CHIP_VALUE_LENGTH = 63;

@Component({
  selector: 'kd-chips',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsComponent implements OnInit, OnChanges {
  @Input() map: StringMap | string[];
  @Input() minChipsVisible = 2;
  keys: string[];
  isShowingAll = false;

  constructor(private readonly dialog_: MatDialog, private readonly cdr_: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.processMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.map) {
      this.processMap();
    }
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
    this.cdr_.markForCheck();
  }

  isVisible(index: number): boolean {
    return this.isShowingAll || index < this.minChipsVisible;
  }

  isAnythingHidden(): boolean {
    return this.keys.length > this.minChipsVisible;
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

  openChipDialog(key: string, value: string): void {
    const dialogConfig: MatDialogConfig<Chip> = {
      width: '630px',
      data: {
        key,
        value,
      },
    };
    this.dialog_.open(ChipDialog, dialogConfig);
  }
}
