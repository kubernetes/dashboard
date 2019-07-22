import {Component, Injector, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {PluginLoaderService} from '../../common/services/pluginloader/pluginloader.service';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'kd-plugin-holder',
  template: `
    <div>
      <div class="plugin">
        <ng-template #pluginViewRef></ng-template>
      </div>
    </div>`
})
export class PluginHolderComponent implements OnInit {
  @ViewChild('pluginViewRef', {read: ViewContainerRef, static: true}) vcRef: ViewContainerRef;

  constructor(private injector: Injector, private pluginLoader: PluginLoaderService,
              private readonly activatedRoute_: ActivatedRoute) {}

  ngOnInit() {
    const pluginName = this.activatedRoute_.snapshot.params.pluginName;
    try {
      this.loadPlugin(pluginName);
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
