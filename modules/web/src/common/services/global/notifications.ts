// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Injectable} from '@angular/core';
import {K8sError} from '@api/root.api';
import {GlobalSettingsService} from './globalsettings';

export class Notification {
  message: string;
  icon: string;
  cssClass: string;
  timestamp: Date;
  read = false;

  constructor(message: string, severity: NotificationSeverity) {
    this.message = message;
    this.icon = severity.toString();
    this.timestamp = new Date();

    switch (severity) {
      case NotificationSeverity.info:
        this.cssClass = 'kd-success';
        break;
      case NotificationSeverity.warning:
        this.cssClass = 'kd-warning';
        break;
      case NotificationSeverity.error:
        this.cssClass = 'kd-error';
        break;
      default:
        this.cssClass = '';
    }
  }
}

export enum NotificationSeverity {
  info = 'info',
  warning = 'warning',
  error = 'error',
}

@Injectable()
export class NotificationsService {
  private notifications_: Notification[] = [];

  constructor(private readonly _globalSettingsService: GlobalSettingsService) {}

  push(message: string, severity: NotificationSeverity): void {
    // Do not add same notifications multiple times
    if (this.notifications_.some(notification => notification.message === message)) {
      return;
    }

    this.notifications_ = [new Notification(message, severity), ...this.notifications_];
  }

  pushErrors(errors: K8sError[]): void {
    if (errors) {
      errors.forEach(error => {
        if (this._shouldAddNotification(error)) {
          this.push(error.ErrStatus.message, NotificationSeverity.error);
        }
      });
    }
  }

  private _shouldAddNotification(error: K8sError): boolean {
    return !this._globalSettingsService.getDisableAccessDeniedNotifications() || !this._isAccessDeniedError(error);
  }

  private _isAccessDeniedError(error: K8sError): boolean {
    return error.ErrStatus.code === 403;
  }

  remove(index: number): void {
    this.notifications_.splice(index, 1);
  }

  getNotifications(): Notification[] {
    return this.notifications_;
  }

  getUnreadCount(): number {
    return this.notifications_
      .map(notification => {
        return notification.read ? Number(0) : Number(1);
      })
      .reduce((previousValue, currentValue) => {
        return previousValue + currentValue;
      }, 0);
  }

  markAllAsRead(): void {
    this.notifications_.forEach(notification => {
      notification.read = true;
    });
  }

  clear(): void {
    this.notifications_ = [];
  }
}
