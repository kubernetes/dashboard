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

import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ObjectMeta, TypeMeta} from '@api/root.api';
import {take} from 'rxjs/operators';

import {VerberService} from '@common/services/global/verber';

@Component({
  selector: 'kd-actionbar-detail-delete',
  templateUrl: './template.html',
})
export class ActionbarDetailDeleteComponent implements OnInit {
  @Input() objectMeta: ObjectMeta;
  @Input() typeMeta: TypeMeta;
  @Input() displayName: string;

  constructor(
    private readonly verber_: VerberService,
    private readonly route_: ActivatedRoute,
    private readonly router_: Router
  ) {}

  ngOnInit(): void {
    this.verber_.onDelete.pipe(take(1)).subscribe(() => {
      this.router_.navigate(['.'], {relativeTo: this.route_, queryParamsHandling: 'preserve'});
    });
  }

  onClick(): void {
    this.verber_.showDeleteDialog(this.displayName, this.typeMeta, this.objectMeta);
  }
}
