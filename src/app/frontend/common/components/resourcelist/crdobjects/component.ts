import {Component, Input} from '@angular/core';
import {CRDObjectList} from '@api/backendapi';

@Component({
  selector: 'kd-crd-object-list',
  templateUrl: './template.html',
})
export class CRDObjectListComponent {
  @Input() objects: CRDObjectList;
}
