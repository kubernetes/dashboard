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
import {K8sError} from '@api/backendapi';

enum NotificationSeverity {
  info = 'info',
  warning = 'warning',
  error = 'error',
}

// TODO(maciaszczykm): Customize it. READ/UNDREAD?
interface Notification {
  severity: NotificationSeverity;
  message: string;
}

@Injectable()
export class NotificationsService {
  private notifications_: Notification[] = [];

  addErrorNotifications(errors: K8sError[]): void {
    errors.forEach(error => {
      this.notifications_.push({
        message: `${error.ErrStatus.message}`,
        severity: NotificationSeverity.error,
      });
    });
  }

  getNotifications(): Notification[] {
    return this.notifications_;
  }

  getNotificationsCount(): number {
    return this.notifications_.length;
  }

  clean(): void {
    this.notifications_ = [];
  }
}
