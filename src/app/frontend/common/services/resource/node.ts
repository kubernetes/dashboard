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

import {HttpClient} from '@angular/common/http';
import {Node, NodeDetail, NodeList} from '@api/backendapi';
import {Observable} from 'rxjs/Observable';

export class NodeService {
  private readonly nodeEndpoint_ = 'api/v1/node/';

  constructor(private http_: HttpClient) {}

  getNodeList(): Observable<NodeList> {
    return this.http_.get<NodeList>(this.nodeEndpoint_);
  }

  getNodes(): Observable<Node[]> {
    return this.getNodeList().map<NodeList, Node[]>(nodeList => {
      return nodeList.nodes;
    });
  }

  getNodeDetail(name: string): Observable<NodeDetail> {
    return this.http_.get<NodeDetail>(this.nodeEndpoint_ + name);
  }
}
