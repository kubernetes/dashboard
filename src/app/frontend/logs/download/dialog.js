
const PROGRESS_UPDATE_TIMEOUT = 500;

/** @final */
class DownloadDialogController {
  /**
   * @param downloadUrl
   * @param fileName
   * @param FileSaver
   * @param $mdDialog
   * @param $q
   * @param kdDownloadService
   * @param $timeout
   * @ngInject
   */
  constructor(downloadUrl, fileName, FileSaver, $mdDialog, $q, kdDownloadService, $timeout) {
    this.downloadUrl_ = downloadUrl;

    this.fileName_ = fileName;

    this.loaded = 0;

    this.lastLoaded = 0;

    this.finished = false;

    this.fileSaver_ = FileSaver;

    this.data;

    this.mdDialog_ = $mdDialog;

    this.canceler_ = $q.defer();

    this.downloadService_ = kdDownloadService;

    this.timeout_ = $timeout;

    this.progressUpdateTimeoutFinished_;
  }

  $onInit() {
    this.downloadService_.downloadFile(this.downloadUrl_, this.progressUpdateCallback.bind(this), this.canceler_)
        .then(this.downloadFinishedCallback.bind(this))
        // Silence the error as we are handling abort in abort function
        .catch(() => {});
  }

  progressUpdateCallback(event) {
    this.lastLoaded = event.loaded;

    if(this.progressUpdateTimeoutFinished_) {
      return;
    }

    this.progressUpdateTimeoutFinished_ = this.timeout_(() => {
      this.progressUpdateTimeoutFinished_ = undefined;
      this.updateProgress(event.loaded);
    }, PROGRESS_UPDATE_TIMEOUT);
  }

  downloadFinishedCallback(response) {
    this.data = response.data;
    this.finished = true;
    this.timeout_.cancel(this.progressUpdateTimeoutFinished_);
    this.loaded = this.lastLoaded;
  }

  updateProgress(loaded) {
    this.loaded = loaded;
  }

  hasDownloadFinished() {
    return this.finished;
  }

  save() {
    this.fileSaver_.saveAs(this.data, this.fileName_);
    this.mdDialog_.hide();
  }

  abort() {
    this.canceler_.resolve();
    this.mdDialog_.hide();
  }

  getDownloadMode() {
    return this.finished ? 'determinate' : 'indeterminate';
  }
}

export function showDownloadDialog(mdDialog, downloadUrl, fileName) {
  return mdDialog.show({
    controller: DownloadDialogController,
    controllerAs: '$ctrl',
    locals: {
      'downloadUrl': downloadUrl,
      'fileName': fileName,
    },
    templateUrl: 'logs/download/dialog.html',
    escapeToClose: false
  })
}
