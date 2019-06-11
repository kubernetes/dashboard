import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'k8s-plugin',
  template: `
    <p>
      plugin works!
    </p>
  `,
  styles: []
})
export class PluginComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
