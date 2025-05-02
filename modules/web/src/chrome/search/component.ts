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

import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {SEARCH_QUERY_STATE_PARAM} from '@common/params/params';
import {ParamsService} from '@common/services/global/params';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'kd-search',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class SearchComponent implements OnInit {
  query: string;
  private destroyRef = inject(DestroyRef);
  constructor(
    private readonly router_: Router,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly paramsService_: ParamsService
  ) {}

  ngOnInit(): void {
    this.activatedRoute_.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(paramMap => {
      this.query = paramMap.get(SEARCH_QUERY_STATE_PARAM);
      this.paramsService_.setQueryParam(SEARCH_QUERY_STATE_PARAM, this.query);
    });
  }

  submit(form: NgForm): void {
    if (form.valid) {
      this.router_.navigate(['search'], {
        queryParamsHandling: 'merge',
        queryParams: {[SEARCH_QUERY_STATE_PARAM]: this.query},
      });
    }
  }
}
