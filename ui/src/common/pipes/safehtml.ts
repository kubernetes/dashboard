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

import {Pipe, SecurityContext} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

// @ts-ignore
import * as ansiColorClass from 'ansi-to-html';

const ansiColor = new ansiColorClass();

enum TextMode {
  Default = 'Default',
  Colored = 'Colored',
}

/**
 * Formats the given value as raw HTML to display to the user.
 */
@Pipe({name: 'kdSafeHtml'})
export class SafeHtmlFormatter {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(value: string, mode: TextMode = TextMode.Default): SafeHtml {
    let result: SafeHtml = null;
    let content = this.sanitizer.sanitize(SecurityContext.HTML, value.replace('<', '&lt;').replace('>', '&gt;'));

    // Handle conversion of ANSI color codes.
    switch (mode) {
      case TextMode.Colored:
        content = ansiColor.toHtml(content.replace(/&#27;/g, '\u001b'));
        result = this.sanitizer.bypassSecurityTrustHtml(content);
        break;

      default:
        // TextMode.Default
        result = content;
        break;
    }

    return result;
  }
}
