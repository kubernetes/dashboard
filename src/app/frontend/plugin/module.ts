import {NgModule} from '@angular/core';

import {ComponentsModule} from '../common/components/module';
import {SharedModule} from '../shared.module';

import {PluginHolderComponent} from './detail/component';
import {PluginListComponent} from './list/component';
import {PluginsRoutingModule} from './routing';

@NgModule({
  imports: [SharedModule, ComponentsModule, PluginsRoutingModule],
  declarations: [PluginListComponent, PluginHolderComponent]
})
export class PluginModule {
}
