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

        this.colors = [
            {'label': "Silver", 'color': "#C0C0C0"},
            {'label': "Gray", 'color': "#808080"},
            {'label': "Black", 'color': "#000000"},
            {'label': "Red", 'color': "#FF0000"},
            {'label': "Maroon", 'color': "#800000"},
            {'label': "Yellow", 'color': "#FFFF00"},
            {'label': "Olive", 'color': "#808000"},
            {'label': "Lime", 'color': "#00FF00"},
            {'label': "Green", 'color': "#008000"},
            {'label': "Aqua", 'color': "#00FFFF"},
            {'label': "Teal", 'color': "#008080"},
            {'label': "Blue", 'color': "#0000FF"},
            {'label': "Navy", 'color': "#000080"},
            {'label': "Fuchsia", 'color': "#FF00FF"},
            {'label': "Purple", 'color': "##800080"},
        ];

    }


    /**
     * @export
     */
    setColors(c) {
        return this.mdDialog_.hide(c);
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
