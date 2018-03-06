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

import {Component, OnInit} from '@angular/core';
import {TransitionService} from '@uirouter/core';

import {Notification, NotificationsService} from '../../common/services/global/notifications';

@Component(
    {selector: 'kd-notifications', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class NotificationsComponent implements OnInit {
  isOpen = false;
  notifications: Notification[] = [];

  constructor(
      private readonly notifications_: NotificationsService,
      private readonly transition_: TransitionService) {}

  ngOnInit(): void {
    this.load_();

    this.transition_.onSuccess({}, () => {
      this.load_();
    });

    this.transition_.onExit({}, () => {
      this.isOpen = false;
      this.notifications_.markAllAsRead();
    });
  }

  load_(): void {
    this.notifications = this.notifications_.getNotifications();
  }

  getUnreadCount(): number {
    return this.notifications_.getUnreadCount();
  }

  clear(): void {
    this.notifications_.clear();
    this.load_();
  }
}
