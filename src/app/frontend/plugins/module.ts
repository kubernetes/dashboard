import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';

import {PluginComponent} from './component';
import {PluginsRoutingModule} from './routing';

@NgModule({imports: [HttpClientModule, PluginsRoutingModule], declarations: [PluginComponent]})
export class PluginsModule {
}
