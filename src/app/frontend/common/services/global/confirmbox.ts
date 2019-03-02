import {ComponentFactory, ComponentFactoryResolver, Injectable, Injector, ViewContainerRef} from '@angular/core';

import {ConfirmDialog} from '../../dialogs/confirmbox/dialog';

@Injectable()
export class DialogService {
  vcRef: ViewContainerRef;
  private factory: ComponentFactory<ConfirmDialog>;

  constructor(resolver: ComponentFactoryResolver) {
    this.factory = resolver.resolveComponentFactory(ConfirmDialog);
  }

  confirm(message = '', details = 'Are you sure?', yesMsg = 'Yes', noMsg = 'No') {
    const componentRef = this.vcRef.createComponent(this.factory);
    const component = componentRef.instance;

    component.message = message;
    component.details = details;
    component.yesMsg = yesMsg;
    component.noMsg = noMsg;

    const destroy = () => componentRef.destroy();
    component.promise.then(destroy, destroy);
    return component.promise;
  }
}
