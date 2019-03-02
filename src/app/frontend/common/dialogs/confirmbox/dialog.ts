import {Component, HostBinding, OnInit} from '@angular/core';

export const wait = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));

@Component({selector: 'app-dialog', templateUrl: 'template.html', styles: []})


export class ConfirmDialog implements OnInit {
  @HostBinding('class.dialog') dialog = true;
  @HostBinding('class.active') visible: boolean;

  message: string;
  details: string;
  yesMsg: string;
  noMsg: string;

  promise: Promise<object>;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.yes = () => {
        this.visible = false;
        wait(300).then(resolve);
      };

      this.no = () => {
        this.visible = false;
        wait(300).then(reject);
      };
    });
  }

  yes() {}
  no() {}

  ngOnInit() {
    wait(50).then(() => this.visible = true);
  }
}
