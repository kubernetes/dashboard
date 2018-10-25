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

import componentsModule from '../common/components/module';
import csrfTokenModule from '../common/csrftoken/module';
import errorHandlingModule from '../common/errorhandling/module';
import historyModule from '../common/history/module';
import validatorsModule from '../common/validators/module';

import {deployFromFileComponent} from './deployfromfile/component';
import {deployFromInputComponent} from './deployfrominput/component';
import {deployFromSettingsComponent} from './deployfromsettings/component';
import {deployLabelComponent} from './deployfromsettings/deploylabel/component';
import {environmentVariablesComponent} from './deployfromsettings/environmentvariables/component';
import helpSectionModule from './deployfromsettings/helpsection/module';
import {portMappingsComponent} from './deployfromsettings/portmappings/component';
import uniqueNameDirective from './deployfromsettings/uniquename_directive';
import validImageReferenceDirective from './deployfromsettings/validimagereference_directive';
import validProtocolDirective from './deployfromsettings/validprotocol_directive';
import {DeployService} from './service';
import stateConfig from './stateconfig';
import {LabelKeyNameLengthValidator} from './validators/labelkeynamelengthvalidator';
import {LabelKeyNamePatternValidator} from './validators/labelkeynamepatternvalidator';
import {LabelKeyPrefixLengthValidator} from './validators/labelkeyprefixlengthvalidator';
import {LabelKeyPrefixPatternValidator} from './validators/labelkeyprefixpatternvalidator';
import {LabelValuePatternValidator} from './validators/labelvaluepatternvalidator';

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
          'ui.ace',
          helpSectionModule.name,
          errorHandlingModule.name,
          validatorsModule.name,
          historyModule.name,
          componentsModule.name,
          csrfTokenModule.name,
        ])
    .config(stateConfig)
    .run(initConfig)
    .component('kdPortMappings', portMappingsComponent)
    .directive('kdUniqueName', uniqueNameDirective)
    .directive('kdValidImagereference', validImageReferenceDirective)
    .directive('kdValidProtocol', validProtocolDirective)
    .component('kdEnvironmentVariables', environmentVariablesComponent)
    .component('kdDeployLabel', deployLabelComponent)
    .component('kdDeployFromFile', deployFromFileComponent)
    .component('kdDeployFromInput', deployFromInputComponent)
    .component('kdDeployFromSettings', deployFromSettingsComponent)
    .service('kdDeployService', DeployService);


/**
 * @param {!../common/validators/factory.ValidatorFactory} kdValidatorFactory
 * @ngInject
 */
function initConfig(kdValidatorFactory) {
  kdValidatorFactory.registerValidator('labelKeyNameLength', new LabelKeyNameLengthValidator());
  kdValidatorFactory.registerValidator('labelKeyPrefixLength', new LabelKeyPrefixLengthValidator());
  kdValidatorFactory.registerValidator('labelKeyNamePattern', new LabelKeyNamePatternValidator());
  kdValidatorFactory.registerValidator(
      'labelKeyPrefixPattern', new LabelKeyPrefixPatternValidator());
  kdValidatorFactory.registerValidator('labelValuePattern', new LabelValuePatternValidator());
}
