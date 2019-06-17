import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PluginModule } from 'k8s-plugin';
import {Plugin1Component} from "./plugin1.component";

@NgModule({
  imports: [CommonModule, PluginModule],
  declarations: [Plugin1Component]
})
export class Plugin1Module {
}
