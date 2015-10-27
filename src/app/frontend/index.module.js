// Copyright 2015 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Entry point module to the application. Loads and configures other modules needed
 * to bootstrap the application.
 */
import {config} from './index.config';
import {RouterController, routerConfig} from './index.route';
import {runBlock} from './index.run';
import {MainController} from './main/main.controller';

export default angular.module(
    'kubernetesConsole',
    ['ngAnimate', 'ngSanitize', 'ngMessages', 'ngAria', 'ngResource', 'ngNewRouter', 'ngMaterial'])
    .config(config)
    .config(routerConfig)
    .run(runBlock)
    .controller('RouterController', RouterController)
    .controller('MainController', MainController);
