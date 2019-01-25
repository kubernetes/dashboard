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

import {Component} from '@angular/core';
import {VersionInfo} from '@api/frontendapi';
import {ConfigService} from '../../common/services/global/config';

@Component({selector: '', templateUrl: './template.html'})
export class ActionbarComponent {
  versionInfo: VersionInfo;

  constructor(config: ConfigService) {
    this.versionInfo = config.getVersionInfo();
  }

  getFeedbackLink(): string {
    const body = `##### Environment\n<!-- Describe your setup. Versions of Node.js, Go etc. are ` +
        `needed only from developers. -->\n\n\`\`\`\nInstallation method:\nKubernetes version:\n` +
        `Dashboard version: ${this.versionInfo.semverString}\nOperating system:\nNode.js version` +
        `('node --version' output):\nGo version ('go version' output):\n\`\`\`\n\n##### Steps to` +
        `reproduce\n<!-- Describe all steps needed to reproduce the issue. It is a good place to` +
        `use numbered list. -->\n\n##### Observed result\n<!-- Describe observed result as ` +
        `precisely as possible. -->\n\n##### Expected result\n<!-- Describe expected result as ` +
        `precisely as possible. -->\n\n##### Comments\n<!-- If you have any comments or more ` +
        `details, put them here. -->`;
    return `https://github.com/kubernetes/dashboard/issues/new?body=${encodeURIComponent(body)}`;
  }
}
