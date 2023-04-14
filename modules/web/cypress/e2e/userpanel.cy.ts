/*
 * Copyright 2017 The Kubernetes Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import {UserpanelPage} from '../pages/userpanelPage';

describe('Userpanel', () => {
  before(() => {
    UserpanelPage.visitHome();
  });

  it('check default namespace', () => {
    UserpanelPage.assertUrlContains('workloads');
  });

  it('collapses sidebar', () => {
    UserpanelPage.assertVisibility('mat-drawer', true);
    UserpanelPage.clickItem('kd-nav-hamburger');
    UserpanelPage.assertVisibility('mat-drawer', false);
  });

  it('home logo click overview redirect check', () => {
    UserpanelPage.clickItem('.kd-toolbar-logo-link');
    UserpanelPage.assertUrlContains('workloads');
  });

  it('add resource', () => {
    UserpanelPage.clickItem('mat-icon.kd-primary-toolbar-icon', 'add');
    UserpanelPage.assertUrlContains('create');
  });

  it('search', () => {
    const searchString = 'test_string';
    UserpanelPage.visitHome();
    UserpanelPage.typeSearch(searchString);
    UserpanelPage.assertUrlContains('q=' + searchString);
    UserpanelPage.visitHome();
  });
});
