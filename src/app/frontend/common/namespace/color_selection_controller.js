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

/**
 * Controller for the edit resource dialog.
 *
 * @final
 */
export class ColorSelectionController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @ngInject
   */
  constructor($mdDialog) {
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    this.styles = [
      {'label': 'Mea Cuppa', 'color': '#191919', 'background-color': '#FFF056'},
      {'label': 'Big Top', 'color': '#C63D0F', 'background-color': '#7E8F7C'},
      {'label': 'Tory\'s Eye', 'color': '#005A31', 'background-color': '#F3FAB6'},
      {'label': 'Event Finds', 'color': '#558C89', 'background-color': '#ECECEA'},
      {'label': 'Cheese Survival Kit', 'color': '#F6F6F6', 'background-color': '#2B2B2B'},
      {'label': 'Nordic Ruby', 'color': '#F5F3EE', 'background-color': '#7D1935'},
      {'label': 'Lake Nona', 'color': '#67BCDB', 'background-color': '#E44424'},
      {'label': 'Lemon Stand', 'color': '#FFE658', 'background-color': '#6DBDD6'},
      {'label': 'Mint', 'color': '#585858', 'background-color': '#C1E1A6'},
      {'label': 'Odopod', 'color': '#DF3D82', 'background-color': '#191919'},
      {'label': 'None'},
    ];
  }


  /**
   * @export
   */
  selectStyle(s) {
    return this.mdDialog_.hide(s);
  }


  /**
   * Cancels and closes the dialog.
   *
   * @export
   */
  cancel() {
    this.mdDialog_.cancel();
  }
}
