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

const baseHref = '/api/v1';

@Injectable()
export class EndpointManager {
  static pod = class {
    static list(): string {
      return `${baseHref}/pod/:namespace`;
    }

    static detail(): string {
      return `${baseHref}/pod/:namespace/:name`;
    }
  };

  static replicaSet = class {
    static list(): string {
      return `${baseHref}/replicaset/:namespace`;
    }

    static detail(): string {
      return `${baseHref}/replicaset/:namespace/:name`;
    }
  };

  static node = class {
    static list(): string {
      return `${baseHref}/node`;
    }

    static detail(): string {
      return `${baseHref}/node/:name`;
    }

    static pods(nodeName: string): string {
      return `${baseHref}/node/${nodeName}/pod`;
    }
  };

  static namespace = class {
    static list(): string {
      return `${baseHref}/namespace`;
    }

    static detail(): string {
      return `${baseHref}/namespace/:name`;
    }
  };

  static persistentVolume = class {
    static list(): string {
      return `${baseHref}/persistentvolume`;
    }

    static detail(): string {
      return `${baseHref}/persistentvolume/:name`;
    }
  };

  static clusterRole = class {
    static list(): string {
      return `${baseHref}/clusterrole`;
    }
  };
}
