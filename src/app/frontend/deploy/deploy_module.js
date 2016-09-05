// Copyright 2015 Google Inc. All Rights Reserved.
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

import componentsModule from 'common/components/components_module';
import historyModule from 'common/history/history_module';
import validatorsModule from 'common/validators/validators_module';

import errorHandlingModule from '../common/errorhandling/errorhandling_module';

import initConfig from './deploy_initconfig';
import stateConfig from './deploy_stateconfig';
import deployLabelDirective from './deploylabel_directive';
import environmentVariablesDirective from './environmentvariables_directive';
import fileReaderDirective from './filereader_directive';
import helpSectionModule from './helpsection/helpsection_module';
import portMappingsDirective from './portmappings_directive';
import uniqueNameDirective from './uniquename_directive';
import uploadDirective from './upload_directive';
import validImageReferenceDirective from './validimagereference_directive';
import validProtocolDirective from './validprotocol_directive';


/**
 * Angular module for the deploy view.
 *
 * The view allows for deploying applications to Kubernetes clusters.
 */
export default angular
    .module(
        'kubernetesDashboard.deploy',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          helpSectionModule.name,
          errorHandlingModule.name,
          validatorsModule.name,
          historyModule.name,
          componentsModule.name,
        ])
    .config(stateConfig)
    .run(initConfig)
    .directive('kdUniqueName', uniqueNameDirective)
    .directive('kdValidImagereference', validImageReferenceDirective)
    .directive('kdValidProtocol', validProtocolDirective)
    .directive('kdFileReader', fileReaderDirective)
    .directive('kdUpload', uploadDirective)
    .directive('kdPortMappings', portMappingsDirective)
    .directive('kdEnvironmentVariables', environmentVariablesDirective)
    .directive('kdDeployLabel', deployLabelDirective);
