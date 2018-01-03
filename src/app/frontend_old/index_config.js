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

/**
 * @param {!md.$mdThemingProvider} $mdThemingProvider
 * @ngInject
 */
export default function config($mdThemingProvider) {
  // Create a color palette that uses Kubernetes colors.
  let kubernetesColorPaletteName = 'kubernetesColorPalette';
  let kubernetesAccentPaletteName = 'kubernetesAccentPallete';
  let kubernetesColorPalette = $mdThemingProvider.extendPalette('blue', {
    '500': '326de6',
  });

  // Use the palette as default one.
  $mdThemingProvider.definePalette(kubernetesColorPaletteName, kubernetesColorPalette);
  $mdThemingProvider.definePalette(kubernetesAccentPaletteName, kubernetesColorPalette);
  $mdThemingProvider.theme('default')
      .primaryPalette(kubernetesColorPaletteName)
      .accentPalette(kubernetesAccentPaletteName);
}
