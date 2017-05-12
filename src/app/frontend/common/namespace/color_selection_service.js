import showColorSelectionDialog from './color_dialog';

export class ColorSelectionService {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$q} $q
   * @ngInject
   */
  constructor($mdDialog, $q) {
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!angular.$q} */
    this.q_ = $q;
  }

  /**
   * Opens a color selection dialog. Returns a promise that is resolved/rejected use selects color.
   * Nothing happens when user clicks cancel on the dialog.
   * @return {!angular.$q.Promise}
   */
  selectColors() {
    let deferred = this.q_.defer();

    showColorSelectionDialog(this.mdDialog_)
        .then((data) => {
          deferred.resolve(data);
        })
        .catch((err) => {
          deferred.reject(err);
        });

    return deferred.promise;
  }
}
