import {Component, Input} from '@angular/core';

export enum StatusBarColor {
  Succeeded = '#66bb6a',
  Running = '#388e3c',
  Failed = '#e53935',
  Suspended = '#ffb300',
  Pending = '#f4511e'
}

export interface StatusBarItem {
  key: string;
  color: string;
  value: number;
}

@Component(
    {selector: 'kd-status-ratio-bar', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class StatusRatioBarComponent {
  @Input() items: StatusBarItem[];

  get data() {
    return this.items.filter(item => item.value !== 0)
        .map(item => ({...item, value: `${item.value}%`}));
  }

  trackByFn = (index: number) => index;
}
