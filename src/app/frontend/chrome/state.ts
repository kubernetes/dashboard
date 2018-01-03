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

/**
 * Name of the namespace state. This state should be used as a parent state for
 * all root states. It provides gobal namespace option for all URLs.
 */
import {Ng2StateDeclaration} from '@uirouter/angular';
import {ChromeComponent} from './component';

export const stateName = 'chrome';

/**
 * Name of the action bar view. Action bar is the second toolbar in the
 * application and can be used for, e.g., breadcrumbs or view-specific action
 * buttons.
 */
const actionbarViewName = 'actionbar';

/**
 * Parameter name of the namespace selection param. Mostly for internal use.
 */
const namespaceParam = 'namespace';

/**
 * To be used in data section in params. Set to true for views that should fill
 * app content.
 *
 * Defaults to false.
 */
const fillContentConfig = 'fillContent';

export let chromeState: Ng2StateDeclaration = {
  name: stateName,
  url: `?${namespaceParam}`,
  abstract: true,
  views: {
    '$default': {
      component: ChromeComponent,
    },
  },
};
