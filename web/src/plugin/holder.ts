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

import {Component, Injector, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';

import {PluginLoaderService} from '@common/services/pluginloader/pluginloader.service';

@Component({
  selector: 'kd-plugin-holder',
  template: `
    <div>
      <div class="plugin">
        <mat-card *ngIf="entryError">This plugin has no entry component</mat-card>
        <ng-template #pluginViewRef #elseBlock></ng-template>
      </div>
    </div>
  `,
})
export class PluginHolderComponent implements OnInit {
  @ViewChild('pluginViewRef', {read: ViewContainerRef, static: true}) vcRef: ViewContainerRef;
  @Input('pluginName') private pluginName: string;
  entryError = false;

  constructor(private injector: Injector, private pluginLoader: PluginLoaderService) {}

  ngOnInit() {
    try {
      this.loadPlugin(this.pluginName);
    } catch (e) {
      console.log(e);
    }
  }

  loadPlugin(pluginName: string) {
    this.pluginLoader.load(pluginName).then(moduleFactory => {
      const moduleRef = moduleFactory.create(this.injector);
      const entryComponent = (moduleFactory.moduleType as any).entry;
      try {
        const compFactory = moduleRef.componentFactoryResolver.resolveComponentFactory(entryComponent);
        this.vcRef.createComponent(compFactory);
      } catch (e) {
        this.entryError = true;
      }
    });
  }
}
