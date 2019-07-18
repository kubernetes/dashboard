import {Component, Injector, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {PluginLoaderService} from '../common/services/pluginloader/pluginloader.service';

@Component({
  selector: 'kd-plugin-view',
  template: `
    <div>
      <div class="plugins">
        <ng-template #pluginViewRef></ng-template>
      </div>
    </div>`
})
export class PluginComponent implements OnInit {
  @ViewChild('pluginViewRef', {read: ViewContainerRef, static: true}) vcRef: ViewContainerRef;

  constructor(private injector: Injector, private pluginLoader: PluginLoaderService) {}

  ngOnInit() {
    try {
      this.loadPlugin('plugin1');
    } catch (e) {
      console.log(e);
    }
  }

  loadPlugin(pluginName: string) {
    this.pluginLoader.load(pluginName).then(moduleFactory => {
      const moduleRef = moduleFactory.create(this.injector);
      // tslint:disable-next-line:no-any
      const entryComponent = (moduleFactory.moduleType as any).entry;
      const compFactory =
          moduleRef.componentFactoryResolver.resolveComponentFactory(entryComponent);
      this.vcRef.createComponent(compFactory);
    });
  }
}
