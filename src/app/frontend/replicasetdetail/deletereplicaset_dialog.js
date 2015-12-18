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
 * Opens replica set delete dialog.
 * @param {!md.$dialog} mdDialog
 * @param {!function()} deleteReplicaSetFn - callback
 */
export default function showDeleteReplicaSetDialog(mdDialog, deleteReplicaSetFn) {
  mdDialog.show(
              mdDialog.confirm()
                  .title('Delete Replica Set')
                  .textContent(
                      'All related pods will be deleted. Are you sure you want to delete this' +
                      ' replica set? ')
                  .ok('Ok')
                  .cancel('Cancel'))
      .then(deleteReplicaSetFn);
}
